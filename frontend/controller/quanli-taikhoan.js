const userList = document.getElementById("user-list");
let isEditing = false;

const logoutBtn = document.getElementById('logout-btn')
const authToken = localStorage.getItem("authToken");

logoutBtn.addEventListener('click', function () {
	// Xóa token và thông tin người dùng khỏi Local Storage
	localStorage.removeItem('authToken');
	// Chuyển hướng người dùng về trang đăng nhập (tùy chọn)
	window.location.href = 'dangnhap.html';
});

async function fetchUsers() {
	try {
		const res = await fetch("http://localhost:5000/api/users",
			{
				headers: {
					"Authorization": `Bearer ${localStorage.getItem('authToken')}`
				}
			}
		);
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const users = await res.json();
		displayUsers(users);
	} catch (err) {
		console.error("Lỗi khi lấy danh sách người dùng:", err);
		userList.innerHTML = `<tr><td colspan="9" style="color: red;">Lỗi tải danh sách người dùng: ${err.message}</td></tr>`;
	}
}

function displayUsers(users) {
	userList.innerHTML = "";
	let number = 1
	users.forEach((user, index) => {
		if (user.deleted) return; // Bỏ qua người dùng đã xóa
		const row = userList.insertRow();
		const stt = row.insertCell();
		const fullName = row.insertCell();
		const email = row.insertCell();
		const phone = row.insertCell();
		const address = row.insertCell();
		const username = row.insertCell();
		const role = row.insertCell();
		const action = row.insertCell();

		stt.textContent = number++;
		fullName.textContent = user.fullname || "N/A";
		email.textContent = user.email || "N/A";
		phone.textContent = user.phone_number || "N/A";
		address.textContent = user.address || "N/A";
		username.textContent = user.username || "N/A";
		role.textContent = user.role || "user";

		const editBtn = document.createElement("button");
		editBtn.textContent = "Sửa";
		editBtn.onclick = () => handleEdit(user, row, editBtn, fullName, email, phone, address, username, role);

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Xóa";
		deleteBtn.onclick = () => handleDelete(user._id);

		action.appendChild(editBtn);
		action.appendChild(deleteBtn);
	});
}


// Hàm xử lý khi nhấn Sửa (tùy bạn triển khai)
function handleEdit(user, row, editBtn, fullName, email, phone, address, username, role) {
	if (!isEditing) {
		row.style.border = "2px solid red";
		row.style.color = "#ccc";

		fullName.contentEditable = "true";
		email.contentEditable = "true";
		phone.contentEditable = "true";
		address.contentEditable = "true";
		username.contentEditable = "true";
		fullName.focus();

		// Thay thế nội dung role bằng select
		const currentRole = role.textContent.trim();
		const select = document.createElement("select");
		select.innerHTML = `
			<option value="admin" ${currentRole === "admin" ? "selected" : ""}>admin</option>
			<option value="user" ${currentRole === "user" ? "selected" : ""}>user</option>
		`;
		role.innerHTML = ""; // Xóa nội dung cũ
		role.appendChild(select);

		editBtn.textContent = "Lưu";
		isEditing = true;

	} else {
		// Lấy thẻ select từ ô role
		const selectedRole = role.querySelector("select").value;

		const updatedUser = {
			fullname: fullName.textContent.trim(),
			email: email.textContent.trim(),
			phone_number: phone.textContent.trim(),
			address: address.textContent.trim(),
			username: username.textContent.trim(),
			role: selectedRole,
		};

		console.log("Cập nhật thông tin người dùng:", updatedUser);

		fetch(`http://localhost:5000/api/users/${user._id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem('authToken')}`
			},
			body: JSON.stringify(updatedUser),
		})
			.then((res) => {
				if (!res.ok) throw new Error("Cập nhật thất bại");
				alert("Cập nhật tài khoản thành công!");
				fetchUsers(); // Load lại danh sách mới
				isEditing = false;
			})
			.catch((err) => {
				console.error("Lỗi khi cập nhật tài khoản:", err);
				alert("Cập nhật tài khoản thất bại.");
			});
	}
}


// Hàm xử lý khi nhấn Xóa (tùy bạn triển khai)
function handleDelete(userId) {
	if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;

	fetch(`http://localhost:5000/api/users/${userId}`, {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${localStorage.getItem('authToken')}`
		}
	})
		.then((res) => {
			if (!res.ok) throw new Error("Xóa thất bại");
			alert("Xóa tài khoản thành công!");
			fetchUsers(); // Refresh lại danh sách
		})
		.catch((err) => {
			console.error("Lỗi khi xóa tài khoản:", err);
			alert("Xóa tài khoản thất bại.");
		});
}

// Gọi khi trang tải
fetchUsers();
