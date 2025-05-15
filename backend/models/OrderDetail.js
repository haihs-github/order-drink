const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderDetailSchema = new Schema({
	order_id: {
		type: Schema.Types.ObjectId,
		ref: 'Order', // Tham chiếu đến model Order
		required: true,
	},
	product_id: {
		type: Schema.Types.ObjectId,
		ref: 'Product', // Tham chiếu đến model Product
		required: true,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	num: {
		type: Number,
		required: true,
		min: 1,
	},
	money: {
		type: Number,
		required: true,
		min: 0,
	}
}, { collection: 'ORDER_DETAIL' }); // Đặt tên collection là "ORDER_DETAIL"


const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);

module.exports = OrderDetail;