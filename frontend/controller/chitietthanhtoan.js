document.addEventListener('DOMContentLoaded', () => {
	const cartData = JSON.parse(localStorage.getItem('cart')) || [];
	const orderSummary = document.querySelector('.order-summary');
	const totalSection = orderSummary.querySelector('.total-section');

	// Xóa các mục đơn hàng cũ nếu có
	const oldItems = orderSummary.querySelectorAll('.order-item');
	oldItems.forEach(item => item.remove());

	let subtotal = 0;

	cartData.forEach(item => {
		const { name, note, quantity, price } = item;
		const total = price * quantity;
		subtotal += total;

		const orderItem = document.createElement('div');
		orderItem.classList.add('order-item');
		orderItem.innerHTML = `
              <img src="https://i.imgur.com/YJvJr3E.png" alt="${name}">
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
document.querySelector('.btn-confirm-order').addEventListener('click', () => {
	// Thực hiện hành động xác nhận đặt hàng
	alert('Đơn hàng của bạn đã được xác nhận!');

	// Xóa giỏ hàng sau khi đặt hàng thành công
	localStorage.removeItem('cart');
	location.reload();
});

document.querySelector('.btn-cancel-order').addEventListener('click', () => {
	// Thực hiện hành động hủy đặt hàng
	if (confirm('Bạn có chắc chắn muốn hủy đơn hàng không?')) {
		// Xóa dữ liệu giỏ hàng và làm mới trang
		localStorage.removeItem('cart');
		location.reload();
	}
});
