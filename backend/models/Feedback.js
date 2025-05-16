const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId, // Nếu liên kết với bảng user
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone_number: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true, // tự động thêm createdAt, updatedAt
	}
);

module.exports = mongoose.model("Feedback", feedbackSchema);
