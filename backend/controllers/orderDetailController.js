const OrderDetail = require('../models/OrderDetail');

// Hàm lấy danh sách tất cả các chi tiết đơn hàng
exports.getAllOrderDetails = async (req, res) => {
	try {
		const orderDetails = await OrderDetail.find().populate('order_id').populate('product_id');
		res.status(200).json(orderDetails);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm lấy thông tin chi tiết của một chi tiết đơn hàng
exports.getOrderDetailById = async (req, res) => {
	try {
		const orderDetail = await OrderDetail.findById(req.params.id).populate('order_id').populate('product_id');
		if (!orderDetail) {
			return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
		}
		res.status(200).json(orderDetail);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm tạo một chi tiết đơn hàng mới
exports.createOrderDetail = async (req, res) => {
	try {
		const { order_id, product_id, price, num, money } = req.body;
		const orderDetail = new OrderDetail({ order_id, product_id, price, num, money });
		await orderDetail.save();
		res.status(201).json({ message: 'Chi tiết đơn hàng đã được tạo thành công', orderDetail });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm cập nhật thông tin chi tiết đơn hàng
exports.updateOrderDetail = async (req, res) => {
	try {
		const { order_id, product_id, price, num, money } = req.body;
		const orderDetail = await OrderDetail.findByIdAndUpdate(req.params.id, { order_id, product_id, price, num, money }, { new: true });
		if (!orderDetail) {
			return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
		}
		res.status(200).json({ message: 'Chi tiết đơn hàng đã được cập nhật thành công', orderDetail });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm xóa một chi tiết đơn hàng
exports.deleteOrderDetail = async (req, res) => {
	try {
		const orderDetail = await OrderDetail.findByIdAndDelete(req.params.id);
		if (!orderDetail) {
			return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
		}
		res.status(200).json({ message: 'Chi tiết đơn hàng đã được xóa thành công' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};