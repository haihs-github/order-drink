const items = document.querySelectorAll('.diachi-item');
const mapIframe = document.querySelector('.khungmap iframe');

items.forEach(item => {
	item.addEventListener('click', () => {
		const newSrc = item.getAttribute('data-src');
		mapIframe.setAttribute('src', newSrc);
	});
});

document.addEventListener('DOMContentLoaded', function () {
	const registrationForm = document.getElementById('registrationForm');
	const passwordInput = document.getElementById('password');
	const validatePasswordInput = document.getElementById('validatePassword');

	registrationForm.addEventListener('submit', function (event) {
		event.preventDefault(); // Ngăn chặn hành vi submit mặc định

		if (passwordInput.value !== validatePasswordInput.value) {
			alert('Mật khẩu nhập lại không khớp!');
			return;
		}

		const formData = new FormData(registrationForm);
		const data = {};
		formData.forEach((value, key) => {
			data[key] = value;
		});

		// Loại bỏ trường nhập lại mật khẩu khỏi dữ liệu gửi đi
		delete data.validatePassword;

		fetch('http://localhost:5000/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(response => response.json())
			.then(responseData => {
				if (responseData.userId) {
					console.log('Thành công:', responseData.userId);
					alert('Đăng ký thành công!');
					window.location.href = 'dangnhap.html';
				} else {
					alert('Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.');
				}
			})
			.catch(error => {
				console.error('Lỗi:', error);
				alert('Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.');
			});
	});
});