const express = require("express");
const Category = require("../models/Category"); // Đảm bảo đường dẫn này đúng với vị trí file model của bạn

// API endpoint để lấy tất cả category
exports.getAllCategorys = async (req, res) => {
	try {
		const categories = await Category.find(); // Lấy tất cả documents từ collection Category
		res.status(200).json(categories); // Trả về danh sách category dưới dạng JSON với status code 200 (OK)
	} catch (error) {
		console.error("Lỗi khi lấy danh sách category:", error);
		res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách category" }); // Trả về lỗi server nếu có vấn đề
	}
}
