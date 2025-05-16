const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["câu chuyện", "khuyến mãi", "sự kiện"],
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	thumbnail: {
		type: String,
		required: true,
		trim: true,
	},
	header: {
		type: String,
	},
	content: {
		type: String,
		required: true,
	},
}, {
	timestamps: true // Tự động thêm createdAt, updatedAt
});

module.exports = mongoose.model("News", newsSchema);
