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
		min: 0,
	}
}, {
	collection: 'ODERS',
	// Virtual field để tính tổng tiền từ các order detail
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual field để tính tổng tiền từ các order detail
OrderSchema.virtual('total_money', {
	ref: 'OrderDetail', // Tham chiếu đến model OrderDetail
	localField: '_id', // Trường nào trong Order model liên kết với OrderDetail (ở đây là _id)
	foreignField: 'order_id', // Trường nào trong OrderDetail model liên kết với Order (ở đây là order_id)
	justOne: false, // Có nhiều OrderDetail cho một Order
});

// Trước khi lưu một Order, tính toán và gán giá trị cho trường money
OrderSchema.pre('save', async function (next) {
	try {
		await this.populate('total_money'); // Lấy các order detail liên quan
		let total = 0;
		this.total_money.forEach(detail => {
			total += detail.money;
		});
		this.money = total; // Gán tổng tiền vào trường money của Order
		next();
	} catch (err) {
		next(err);
	}
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;