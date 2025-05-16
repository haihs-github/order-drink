const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User', // Tham chiếu đến model User (nếu có)
		required: true, // tùy thuộc vào việc bạn có bắt buộc user phải đăng nhập để đặt hàng không
	},
	fullname: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
	},
	phone_number: {
		type: String,
		required: true,
		trim: true,
	},
	address: {
		type: String,
		required: true,
		trim: true,
	},
	content: {
		type: String,
		required: false, // Không phải lúc nào cũng có nội dung
		trim: true,
		maxlength: 1000,
	},
	order_date: {
		type: Date,
		default: Date.now,
	},
	status: {
		type: String,
		enum: ["Đang chờ xử lý", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"],
		default: "Đang chờ xử lý",
		required: true,
	},
	money: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
	},

}, {
	timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;