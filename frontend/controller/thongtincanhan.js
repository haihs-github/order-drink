
// check login
document.addEventListener('DOMContentLoaded', async function () {
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
			usernameDisplaySpan.onclick = function () {
				// Chuyển hướng đến trang cá nhân
				window.location.href = 'thongtincanhan.html';
			}
			usernameDisplaySpan.onclick = function () {
				// Chuyển hướng đến trang cá nhân
				window.location.href = 'thongtincanhan.html';
			}
			usernameDisplaySpan.onclick = function () {
				// Chuyển hướng đến trang cá nhân
				window.location.href = 'thongtincanhan.html';
			}
			usernameDisplaySpan.onclick = function () {
				// Chuyển hướng đến trang cá nhân
				window.location.href = 'thongtincanhan.html';
			}
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

	// load thông tin cá nhân
	const authToken = localStorage.getItem('authToken');
	const data = decodeJwt(authToken)
	const user = await fetch(`http://localhost:5000/api/users/${data.userId}`)
		.then(res => {
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}
			return res.json();
		})
		.then(data => {
			console.log("user", data)
			return data;
		}).catch(error => {
			console.error('Error fetching user data:', error);
		})
	console.log("user", user)
	// render thông tin cá nhân
	const usertable = document.getElementById('profile-container');
	console.log("usertable", usertable)
	usertable.innerHTML = ``;
	usertable.innerHTML = `<h2>Thông Tin Cá Nhân</h2>
                <div class="info-group">
                    <label>Họ tên:</label>
                    <p>${user.fullname}</p>
                </div>

                <div class="info-group">
                    <label>Tên tài khoản:</label>
                    <p>${user.username}</p>
                </div>

                <div class="info-group">
                    <label>Email:</label>
                    <p>${user.email}</p>
                </div>

                <div class="info-group">
                    <label>Số điện thoại:</label>
                    <p>${user.phone_number}</p>
                </div>

                <div class="info-group">
                    <label>Địa chỉ:</label>
                    <p>${user.address}</p>
                </div>`
});

