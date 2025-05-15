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
document.querySelector('.btn-confirm-order').addEventListener('click', (e) => {
	// e.preventDefault(); // Ngăn chặn form gửi đi theo cách thông thường

	// Lấy thông tin từ form thanh toán
	const name = document.getElementById('name').value;
	const phone = document.getElementById('phone').value;
	const email = document.getElementById('email').value;
	const address = document.getElementById('address').value;
	const note = document.getElementById('note').value;
	const cartData = JSON.parse(localStorage.getItem('cart')) || []
	// lấy userid
	const authToken = localStorage.getItem('authToken');
	let userId = null;
	if (authToken) {
		try {
			const tokenData = JSON.parse(atob(authToken.split('.')[1]));
			userId = tokenData.userId;
		} catch (error) {
			console.error("Error decoding authToken:", error);
			return;
		}
	} else {
		alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để đặt hàng.');
		window.location.href = 'dangnhap.html'; // Chuyển hướng đến trang đăng nhập
		return;
	}

	// Kiểm tra xem các trường bắt buộc đã được điền chưa
	if (!name || !phone || !address || !cartData) {
		alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
		return; // Dừng việc gửi đơn hàng
	}

	// Tạo đối tượng chứa dữ liệu đơn hàng
	const orderData = {
		user_id: userId,
		fullname: name,
		email: email,
		phone_number: phone,
		address: address,
		content: note,
		status: 'Đang chờ xử lý',
		order_details: cartData, // Gửi cả thông tin sản phẩm trong giỏ hàng
	};

	console.log('Order data:', orderData);

	// Gửi dữ liệu đơn hàng lên server (sử dụng fetch hoặc XMLHttpRequest)
	fetch('http://localhost:5000/api/orders', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(orderData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			// Xử lý phản hồi từ server (ví dụ: hiển thị thông báo thành công)
			console.log('Order placed successfully:', data);
			alert('Đặt hàng thành công!');

			// Xóa giỏ hàng khỏi localStorage sau khi đặt hàng thành công
			localStorage.removeItem('cart');
			// Chuyển hướng người dùng đến trang khác (ví dụ: trang cảm ơn)
			window.location.href = 'sanpham.html'; // Thay đổi đường dẫn nếu cần
		})
		.catch(error => {
			// Xử lý lỗi (ví dụ: hiển thị thông báo lỗi cho người dùng)
			console.error('Error placing order:', error);
			alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
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

