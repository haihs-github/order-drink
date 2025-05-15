
const items = document.querySelectorAll('.diachi-item');
const mapIframe = document.querySelector('.khungmap iframe');

items.forEach(item => {
	item.addEventListener('click', () => {
		const newSrc = item.getAttribute('data-src');
		mapIframe.setAttribute('src', newSrc);
	});
});

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

					// Bạn có thể chuyển hướng người dùng đến trang chính sau khi đăng nhập
					window.history.back()
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

