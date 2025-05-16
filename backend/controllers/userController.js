// import models
const User = require("../models/User");

// Lấy tất cả sản phẩm (có thể có phân trang, tìm kiếm, lọc)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().populate("username");
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Sửa một sản phẩm theo ID
exports.updateUser = async (req, res) => {
	try {
		const { fullname, email, phone_number, address, username, role } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				fullname,
				email,
				phone_number,
				address,
				username,
				role,
			},
			{ new: true }
		);
		if (!updatedUser) {
			return res.status(404).json({ message: "Không tìm thấy người dùng" });
		}
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Lấy một sản phẩm theo ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate(
			"username"
		);
		if (!user) {
			return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


exports.softDeleteUser = async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ deleted: true },
			{ new: true }
		);
		if (!updatedUser) {
			return res
				.status(404)
				.json({ message: "Không tìm thấy người dùng để xóa" });
		}
		res.status(200).json({ message: "Người dùng đã được xóa (soft delete)" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

