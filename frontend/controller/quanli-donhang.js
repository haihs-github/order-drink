const orderList = document.getElementById("product-list");
const orderDetailModal = document.getElementById("orderDetailModal");
const orderDetailsTableBody = document.querySelector("#orderDetailModal table tbody");
const closeButton = document.querySelector(".close-button");
const editButton = document.querySelector(".edit-button");
const cancelButton = document.querySelector(".cancel-button");
const logoutBtn = document.getElementById('logout-btn')

let currentOrderId = null;
let isEditing = false;
// ======================= auth ===========================
const authToken = localStorage.getItem("authToken");

logoutBtn.addEventListener('click', function () {
	// Xóa token và thông tin người dùng khỏi Local Storage
	localStorage.removeItem('authToken');
	// Chuyển hướng người dùng về trang đăng nhập (tùy chọn)
	window.location.href = 'dangnhap.html';
});


function decodeJwt(token) {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("Lỗi giải mã token:", error);
		return null;
	}

}
function checkLoginStatus() {
	if (authToken) {
		const data = decodeJwt(authToken)
		console.log("data", data)
		if (data.role !== 'admin') {
			alert("Bạn không có quyền truy cập vào trang này.");
			document.innerHTML = "<h1>403 Forbidden</h1>";
			window.location.href = 'dangnhap.html'
			return
		}
	} else {
		document.innerHTML = "<h1>403 Forbidden</h1>";
		window.location.href = 'dangnhap.html'
	}

}
checkLoginStatus()


// ======================= FETCH ===========================
async function fetchOrders() {
	try {
		console.log('authtk', localStorage.getItem('authToken'))
		const res = await fetch("http://localhost:5000/api/orders",
			{
				headers: {
					"Authorization": `Bearer ${localStorage.getItem('authToken')}`
				}
			}
		);
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const orders = await res.json();
		console.log("orders", orders);
		displayOrders(orders);
	} catch (err) {
		console.error("Failed to fetch orders:", err);
		orderList.innerHTML = `<tr><td colspan="7" class="error-message">Lỗi tải đơn hàng: ${err.message}</td></tr>`;
	}
}

async function fetchOrderDetails(orderId) {
	try {
		const res = await fetch(`http://localhost:5000/api/orders/order-details/${orderId}`, {
			headers: {
				"Authorization": `Bearer ${localStorage.getItem('authToken')}`
			}
		});
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const details = await res.json();
		displayOrderDetails(details);
	} catch (err) {
		console.error("Failed to fetch order details:", err);
		alert("Không thể tải chi tiết đơn hàng.");
	}
}

async function fetchProductName(productId) {
	try {
		const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
			headers: {
				"Authorization": `Bearer ${localStorage.getItem('authToken')}`
			}
		});
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const product = await res.json();
		return product.title || "Không tìm thấy tên sản phẩm";
	} catch (err) {
		console.error("Fetch product name failed:", err);
		return "Không tìm thấy tên sản phẩm";
	}
}

// ======================= DISPLAY ===========================
function displayOrders(orders) {
	orderList.innerHTML = "";

	orders.forEach((order, index) => {
		const row = orderList.insertRow();

		const stt = row.insertCell();
		const fullname = row.insertCell();
		const email = row.insertCell();
		const address = row.insertCell();
		const phone = row.insertCell();
		const content = row.insertCell();
		const detail = row.insertCell();
		const time = row.insertCell();
		const total = row.insertCell();
		const status = row.insertCell();
		const action = row.insertCell();

		console.log("order", order);

		stt.textContent = index + 1;
		fullname.textContent = order.fullname;
		email.textContent = order.email;
		address.textContent = order.address;
		phone.textContent = order.phone_number;
		content.textContent = order.content || "Không có ghi chú";
		time.textContent = new Date(order.order_date).toLocaleString("vi-VN");
		total.textContent = `${order.money.toLocaleString("vi-VN")} VND`;
		status.textContent = order.status;

		const viewBtn = document.createElement("button");
		viewBtn.textContent = "Xem";
		viewBtn.onclick = () => {
			currentOrderId = order._id;
			fetchOrderDetails(order._id);
		};
		detail.appendChild(viewBtn);

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Xóa";
		deleteBtn.onclick = () => handleDelete(order._id);

		const editBtn = document.createElement("button");
		editBtn.textContent = "Sửa";
		editBtn.onclick = () => handleEdit(editBtn, row, order);

		action.appendChild(deleteBtn);
		action.appendChild(editBtn);
	});
}

async function displayOrderDetails(details) {
	orderDetailsTableBody.innerHTML = "";
	let total = 0;

	for (let i = 0; i < details.length; i++) {
		const detail = details[i];
		const row = orderDetailsTableBody.insertRow();
		const stt = row.insertCell();
		const productName = row.insertCell();
		const price = row.insertCell();
		const quantity = row.insertCell();
		const lineTotal = row.insertCell();

		stt.textContent = i + 1;
		productName.textContent = await fetchProductName(detail.product_id);
		price.textContent = `${detail.price.toLocaleString("vi-VN")} VND`;
		quantity.textContent = detail.num;
		const money = detail.price * detail.num;
		lineTotal.textContent = `${money.toLocaleString("vi-VN")} VND`;
		total += money;
	}

	const totalRow = orderDetailsTableBody.insertRow();
	const label = totalRow.insertCell();
	label.colSpan = 4;
	label.textContent = "Tổng cộng:";
	const value = totalRow.insertCell();
	value.textContent = `${total.toLocaleString("vi-VN")} VND`;
	value.style.fontWeight = "bold";

	orderDetailModal.style.display = "block";
}

// ======================= ACTION HANDLERS ===========================
function handleDelete(orderId) {
	if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;

	fetch(`http://localhost:5000/api/orders/${orderId}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${localStorage.getItem('authToken')}`
		},
	})
		.then(res => res.json())
		.then(() => {
			alert("Xóa đơn hàng thành công!");
			fetchOrders();
		})
		.catch(err => {
			console.error("Delete failed:", err);
			alert("Xóa đơn hàng thất bại.");
		});
}

function handleEdit(button, row, order) {
	if (isEditing) return; // Chỉ cho phép sửa 1 dòng tại 1 thời điểm
	isEditing = true;

	const [fullname, email, address, phone, content, , , total, status] = row.cells;

	fullname.contentEditable = "true";
	email.contentEditable = "true";
	address.contentEditable = "true";
	phone.contentEditable = "true";
	content.contentEditable = "true";
	total.contentEditable = "true";

	const statusSelect = document.createElement("select");
	statusSelect.innerHTML = `
		<option value="Đang chờ xử lý">Đang chờ xử lý</option>
		<option value="Đã xác nhận">Đã xác nhận</option>
		<option value="Đang giao">Đang giao</option>
		<option value="Đã giao">Đã giao</option>
		<option value="Đã hủy">Đã hủy</option>`;
	statusSelect.value = order.status;
	status.textContent = "";
	status.appendChild(statusSelect);

	row.style.border = "2px solid red";
	button.textContent = "Lưu";

	button.onclick = () => {
		const updatedOrder = {
			fullname: fullname.textContent.trim(),
			email: email.textContent.trim(),
			address: address.textContent.trim(),
			phone_number: phone.textContent.trim(),
			content: content.textContent.trim(),
			money: total.textContent.replace(/[^0-9]/g, ""),
			status: statusSelect.value,
			order_details: order.order_details,
		};

		fetch(`http://localhost:5000/api/orders/${order._id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem('authToken')}`
			},
			body: JSON.stringify(updatedOrder),
		})
			.then(res => res.json())
			.then(() => {
				alert("Cập nhật đơn hàng thành công!");
				isEditing = false;
				fetchOrders();
			})
			.catch(err => {
				console.error("Update failed:", err);
				alert("Cập nhật đơn hàng thất bại.");
			});
	};
}

// ======================= MODAL EVENTS ===========================
closeButton.onclick = () => {
	orderDetailModal.style.display = "none";
};

window.onclick = (event) => {
	if (event.target === orderDetailModal) {
		orderDetailModal.style.display = "none";
	}
};

cancelButton.onclick = () => {
	orderDetailModal.style.display = "none";
};

// editButton.onclick = () => {
// 	if (!currentOrderId) {
// 		alert("Không có đơn hàng nào được chọn để sửa.");
// 	}
// };

// ======================= INIT ===========================
fetchOrders();

