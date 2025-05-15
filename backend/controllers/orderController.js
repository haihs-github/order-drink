const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Hàm lấy danh sách tất cả các đơn hàng
exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().populate('user_id'); // Lấy thông tin người dùng
		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm lấy thông tin chi tiết của một đơn hàng
exports.getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id).populate('user_id');
		if (!order) {
			return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
		}
		// Lấy thêm chi tiết đơn hàng
		const orderDetails = await OrderDetail.find({ order_id: req.params.id }).populate('product_id');
		res.status(200).json({ order, orderDetails });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm tạo một đơn hàng mới
exports.createOrder = async (req, res) => {
	console.log('req.body', req.body);
	try {
		const { user_id, fullname, email, phone_number, address, content, status, order_details } = req.body;
		// Tạo đơn hàng
		const order = new Order({ user_id, fullname, email, phone_number, address, content, status });
		await order.save();

		let totalMoney = 0;
		// Tạo chi tiết đơn hàng
		for (const detail of order_details) {
			console.log('detail', detail);
			const product = await Product.findOne({ title: detail.name }); // Changed to findOne and use detail.product_name
			console.log('product', product);
			if (!product) {
				// Nếu không tìm thấy sản phẩm, xử lý lỗi
				return res.status(400).json({ message: 'Không tìm thấy sản phẩm với tên: ' + detail.product_name }); //send error message
			}
			const orderDetail = new OrderDetail({
				order_id: order._id,
				product_id: product._id,
				price: detail.price,
				num: detail.quantity,
				money: detail.price * detail.quantity,
			});
			await orderDetail.save();
			totalMoney += orderDetail.money;
		}
		order.money = totalMoney;
		console.log('order', order);
		await order.save();
		res.status(200).json({ message: 'Đơn hàng đã được tạo thành công', order });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Hàm cập nhật thông tin đơn hàng
exports.updateOrder = async (req, res) => {
	// Bắt đầu transaction
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { user_id, fullname, email, phone_number, address, content, status, order_details } = req.body;
		const orderId = req.params.id;

		// Kiểm tra xem đơn hàng có tồn tại không
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
		}

		// Cập nhật đơn hàng
		order.user_id = user_id;
		order.fullname = fullname;
		order.email = email;
		order.phone_number = phone_number;
		order.address = address;
		order.content = content;
		order.status = status;

		// Xóa các chi tiết đơn hàng cũ
		await OrderDetail.deleteMany({ order_id: orderId }, { session });

		let totalMoney = 0;
		// Tạo chi tiết đơn hàng mới
		if (order_details && Array.isArray(order_details)) {
			for (const detail of order_details) {
				const orderDetail = new OrderDetail({
					order_id: orderId,
					product_id: detail.product_id,
					price: detail.price,
					num: detail.num,
					money: detail.price * detail.num,
				});
				await orderDetail.save({ session });
				totalMoney += orderDetail.money;
			}
		}
		order.money = totalMoney;
		await order.save({ session });

		await session.commitTransaction();
		session.endSession();
		res.status(200).json({ message: 'Đơn hàng đã được cập nhật thành công', order });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		res.status(500).json({ message: error.message });
	}
};

// Hàm xóa một đơn hàng
exports.deleteOrder = async (req, res) => {
	// Bắt đầu transaction
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const orderId = req.params.id;
		// Kiểm tra xem đơn hàng có tồn tại không
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
		}

		// Xóa các chi tiết đơn hàng liên quan
		await OrderDetail.deleteMany({ order_id: orderId }, { session });
		// Xóa đơn hàng
		await Order.deleteOne({ _id: orderId }, { session });

		await session.commitTransaction();
		session.endSession();
		res.status(200).json({ message: 'Đơn hàng đã được xóa thành công' });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		res.status(500).json({ message: error.message });
	}
};