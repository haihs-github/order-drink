const items = document.querySelectorAll('.diachi-item');
const mapIframe = document.querySelector('.khungmap iframe');

items.forEach(item => {
	item.addEventListener('click', () => {
		const newSrc = item.getAttribute('data-src');
		mapIframe.setAttribute('src', newSrc);
	});
});

// check login

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

document.addEventListener('DOMContentLoaded', function () {
	const loginButtonsDiv = document.getElementById('login-buttons');
	const userInfoDiv = document.getElementById('user-info');
	const usernameDisplaySpan = document.getElementById('username-display');
	const logoutButton = document.getElementById('logout-button');
	// hàm giải mã token

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
});

// xử lý form liên hệ

document.querySelector('.t5-lienhe-box1').addEventListener('submit', async function (e) {
	e.preventDefault(); // Ngăn form gửi theo cách mặc định
	const authToken = localStorage.getItem('authToken');
	if (!authToken) {
		alert('Vui lòng đăng nhập để gửi phản hồi');
		window.location.href = 'dangnhap.html';
		return;
	}
	const decodedToken = decodeJwt(authToken);
	const userId = decodedToken.userId; // Lấy userId từ token
	// Lấy dữ liệu từ các input
	const name = document.getElementById('name').value.trim();
	const email = document.getElementById('email').value.trim();
	const phone = document.getElementById('phone').value.trim();
	const content = document.getElementById('feedback').value.trim();

	// Kiểm tra nếu thiếu thông tin
	if (!name || !email || !phone || !feedback) {
		alert('Vui lòng điền đầy đủ thông tin');
		return;
	}

	// Tạo đối tượng dữ liệu
	const data = {
		user_id: userId,
		name,
		email,
		phone_number: phone,
		content
	};
	console.log("feedback", data)
	try {
		// Gửi dữ liệu tới API sử dụng fetch
		const response = await fetch('http://localhost:5000/api/feedbacks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const result = await response.json();

		if (response.ok) {
			alert('Gửi phản hồi thành công!');
			// Xóa dữ liệu sau khi gửi thành công
			document.getElementById('name').value = '';
			document.getElementById('email').value = '';
			document.getElementById('phone').value = '';
			document.getElementById('feedback').value = '';
		} else {
			alert('Có lỗi xảy ra: ' + (result.message || 'Không xác định'));
		}
	} catch (error) {
		console.error('Lỗi khi gửi phản hồi:', error);
		alert('Không thể kết nối đến máy chủ');
	}
});
