
const items = document.querySelectorAll('.diachi-item');
const mapIframe = document.querySelector('.khungmap iframe');

items.forEach(item => {
	item.addEventListener('click', () => {
		const newSrc = item.getAttribute('data-src');
		mapIframe.setAttribute('src', newSrc);
	});
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

document.addEventListener('DOMContentLoaded', function () {
	const loginForm = document.getElementById('t5-lienhe-box1');

	loginForm.addEventListener('submit', function (event) {
		event.preventDefault(); // Ngăn chặn hành vi submit mặc định của form

		const formData = new FormData(loginForm);
		const data = {};
		formData.forEach((value, key) => {
			data[key] = value;
		});

		fetch('http://localhost:5000/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(response => response.json())
			.then(responseData => {
				if (responseData.ok) {
					console.log('Đăng nhập thành công:', responseData);
					alert('Đăng nhập thành công!');

					// Lưu token vào Local Storage
					localStorage.setItem('authToken', responseData.token);
					console.log('Token đã được lưu:', localStorage.getItem('authToken'));
					const data = decodeJwt(localStorage.getItem('authToken'))
					// Bạn có thể chuyển hướng người dùng đến trang chính sau khi đăng nhập
					if (data.role === 'admin') {
						window.location.href = 'quanli-sanpham.html'
					} else {
						window.location.href = 'trangchu.html'
					}
				} else {
					console.error('Đăng nhập thất bại:', responseData.message);
					alert('Đăng nhập thất bại: ' + responseData.message);
				}
			})
			.catch(error => {
				console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
				alert('Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.');
			});
	});
});

