// check login

document.addEventListener('DOMContentLoaded', function () {
	const loginButtonsDiv = document.getElementById('login-buttons');
	const userInfoDiv = document.getElementById('user-info');
	const usernameDisplaySpan = document.getElementById('username-display');
	const logoutButton = document.getElementById('logout-button');
	// hàm giải mã token
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
	// Hàm kiểm tra xem token có tồn tại trong Local Storage hay không
	function checkLoginStatus() {
		const authToken = localStorage.getItem('authToken');
		if (authToken) {
			const data = decodeJwt(authToken)
			console.log("data", data)
			const loggedInUsername = data.username || 'Người dùng';
			// Ẩn nút đăng nhập/đăng ký
			loginButtonsDiv.style.display = 'none';
			// Hiển thị thông tin người dùng và nút đăng xuất
			usernameDisplaySpan.textContent = loggedInUsername;
			usernameDisplaySpan.onclick = function () {
				// Chuyển hướng đến trang cá nhân
				window.location.href = 'thongtincanhan.html';
			}
			userInfoDiv.style.display = 'flex'; // Sử dụng flex để các phần tử nằm trên cùng một dòng
			userInfoDiv.style.alignItems = 'center'; // Căn giữa theo chiều dọc
		} else {
			// Nếu không có token, hiển thị nút đăng nhập/đăng ký
			loginButtonsDiv.style.display = 'flex';
			// Ẩn thông tin người dùng và nút đăng xuất
			userInfoDiv.style.display = 'none';
			if (confirm("Vui lòng đăng nhập để xem thông tin đơn hàng")) {
				window.location.href = "dangnhap.html"
			} else {
				window.history.back()
			}
		}
	}

	// Gọi hàm kiểm tra trạng thái đăng nhập khi trang được tải
	checkLoginStatus();

	// Xử lý sự kiện click cho nút đăng xuất
	logoutButton.addEventListener('click', function () {
		// Xóa token và thông tin người dùng khỏi Local Storage
		localStorage.removeItem('authToken');
		localStorage.removeItem('loggedInUsername'); // Nếu bạn lưu username

		// Gọi lại hàm kiểm tra trạng thái đăng nhập để cập nhật giao diện
		checkLoginStatus();

		// Chuyển hướng người dùng về trang đăng nhập (tùy chọn)
		window.location.href = 'dangnhap.html';
	});

	// ======================= ORDER EVENTS ===========================
	// Lấy danh sách đơn hàng
	const orderList = document.getElementById("product-list");
	const orderDetailModal = document.getElementById("orderDetailModal");
	const orderDetailsTableBody = document.querySelector("#orderDetailModal table tbody");
	const closeButton = document.querySelector(".close-button");
	const cancelButton = document.querySelector(".cancel-button");


	async function fetchOrders() {
		// Lấy token từ Local Storage
		const authToken = localStorage.getItem('authToken');
		const user = decodeJwt(authToken);
		console.log("api", `http://localhost:5000/api/orders/customer/${user.userId}`)
		try {
			const res = await fetch(`http://localhost:5000/api/orders/customer/${user.userId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`
				}
			});
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			const orders = await res.json();
			console.log("orders", orders);
			displayOrders(orders);
		} catch (err) {
			console.error("Failed to fetch orders:", err);
			orderList.innerHTML = `<tr><td colspan="7" class="error-message">Lỗi tải đơn hàng: ${err.message}</td></tr>`;
		}
	}

	function displayOrders(orders) {
		orderList.innerHTML = "";

		orders.forEach((order, index) => {
			const row = orderList.insertRow();

			const stt = row.insertCell();
			const detail = row.insertCell();
			const total = row.insertCell();
			const status = row.insertCell();
			const time = row.insertCell();
			const action = row.insertCell();

			console.log("order", order);

			stt.textContent = index + 1;
			time.textContent = new Date(order.updatedAt).toLocaleString("vi-VN");
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
			deleteBtn.textContent = "Hủy đơn";
			deleteBtn.onclick = () => handleDelete(order._id);
			action.appendChild(deleteBtn);
		});
	}

	async function fetchOrderDetails(orderId) {
		try {
			const res = await fetch(`http://localhost:5000/api/orders/order-details/${orderId}`);
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
			const res = await fetch(`http://localhost:5000/api/products/${productId}`);
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			const product = await res.json();
			return product.title || "Không tìm thấy tên sản phẩm";
		} catch (err) {
			console.error("Fetch product name failed:", err);
			return "Không tìm thấy tên sản phẩm";
		}
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
		if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

		const authToken = localStorage.getItem('authToken');
		const user = decodeJwt(authToken);

		fetch(`http://localhost:5000/api/orders/cancel/${orderId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.userId }),
		})
			.then(res => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then(() => {
				alert("Hủy đơn hàng thành công!");
				fetchOrders();
			})
			.catch(err => {
				console.error("cancel failed:", err);
				alert("Hủy đơn hàng thất bại.");
			});
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
	fetchOrders();
});

