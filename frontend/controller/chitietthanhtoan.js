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
			//protected routes
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
			if (confirm("Yêu cầu đăng nhập để đặt hàng")) {
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
});

document.addEventListener('DOMContentLoaded', () => {
	const cartData = JSON.parse(localStorage.getItem('cart')) || [];
	const orderSummary = document.querySelector('.order-summary');
	const totalSection = orderSummary.querySelector('.total-section');

	// Xóa các mục đơn hàng cũ nếu có
	const oldItems = orderSummary.querySelectorAll('.order-item');
	oldItems.forEach(item => item.remove());

	let subtotal = 0;

	cartData.forEach(item => {
		const { name, note, quantity, price, src } = item;
		const total = price * quantity;
		subtotal += total;

		const orderItem = document.createElement('div');
		orderItem.classList.add('order-item');
		orderItem.innerHTML = `
              <div class="item-info">
                <p>${name}</p>
                <p>${note} (SL: ${quantity})</p>
                <p><strong>${total.toLocaleString('vi-VN')} VNĐ</strong></p>
              </div>
            `;
		orderSummary.insertBefore(orderItem, totalSection);
	});

	// Cập nhật tổng tiền
	const shippingFee = 0;
	const grandTotal = subtotal + shippingFee;

	totalSection.innerHTML = `
            <p><span>Số tiền</span> <span>${subtotal.toLocaleString('vi-VN')} VNĐ</span></p>
            <p><span>Phí vận chuyển</span> <span>${shippingFee.toLocaleString('vi-VN')} VNĐ</span></p>
            <p><span>Hình thức thanh toán</span> <span>Thanh toán khi nhận hàng</span></p>
            <p><strong>Tổng thanh toán</strong> <strong>${grandTotal.toLocaleString('vi-VN')} VNĐ</strong></p>
          `;
});
// xử lí nút xác nhận đặt hàng
document.querySelector('.btn-confirm-order').addEventListener('click', function (e) {
	e.preventDefault(); // Ngăn form gửi tự động

	// Lấy thông tin từ form
	const nameInput = document.getElementById('name');
	const phoneInput = document.getElementById('phone');
	const emailInput = document.getElementById('email');
	const addressInput = document.getElementById('address');
	const noteInput = document.getElementById('note');

	const name = nameInput.value.trim();
	const phone = phoneInput.value.trim();
	const email = emailInput.value.trim();
	const address = addressInput.value.trim();
	const note = noteInput.value.trim();

	// Regex kiểm tra
	const phoneRegex = /^(0|\+84)\d{9}$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Kiểm tra hợp lệ
	if (!name) {
		alert("Vui lòng nhập họ và tên.");
		nameInput.focus();
		return;
	}

	if (!phoneRegex.test(phone)) {
		alert("Vui lòng nhập số điện thoại hợp lệ (VD: 0981234567).");
		phoneInput.focus();
		return;
	}

	if (!emailRegex.test(email)) {
		alert("Vui lòng nhập email hợp lệ.");
		emailInput.focus();
		return;
	}

	if (!address) {
		alert(" Vui lòng nhập địa chỉ giao hàng.");
		addressInput.focus();
		return;
	}

	// Kiểm tra đăng nhập
	const authToken = localStorage.getItem('authToken');
	if (!authToken) {
		alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để đặt hàng.');
		window.location.href = 'dangnhap.html';
		return;
	}

	// Giải mã JWT
	let userId = null;
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

	const tokenData = decodeJwt(authToken);
	if (!tokenData || !tokenData.userId) {
		alert('Lỗi xác thực. Vui lòng đăng nhập lại.');
		return;
	}
	userId = tokenData.userId;

	// Lấy giỏ hàng
	const cartData = JSON.parse(localStorage.getItem('cart')) || [];
	if (cartData.length === 0) {
		alert('Giỏ hàng của bạn đang trống.');
		return;
	}

	// Tạo đơn hàng
	const orderData = {
		user_id: userId,
		fullname: name,
		email: email,
		phone_number: phone,
		address: address,
		content: note,
		status: 'Đang chờ xử lý',
		order_details: cartData,
	};

	console.log('Order data:', orderData);

	// Gửi đơn hàng
	fetch('http://localhost:5000/api/orders', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${authToken}`
		},
		body: JSON.stringify(orderData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error(`Lỗi HTTP: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			alert('🎉 Đặt hàng thành công!');
			localStorage.removeItem('cart');
			window.location.href = 'sanpham.html';
		})
		.catch(error => {
			console.error('Lỗi khi đặt hàng:', error);
			alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại sau.');
		});
});


document.querySelector('.btn-cancel-order').addEventListener('click', () => {
	// Thực hiện hành động hủy đặt hàng
	if (confirm('Bạn có chắc chắn muốn hủy đơn hàng không?')) {
		// Xóa dữ liệu giỏ hàng và làm mới trang
		localStorage.removeItem('cart');
		window.location.href = 'sanpham.html'; // Chuyển hướng đến trang đăng nhập

	}
});

