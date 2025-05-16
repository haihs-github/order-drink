const Feedback = require("../models/Feedback");

// [GET] /api/feedbacks - Lấy danh sách feedback
exports.getAllFeedbacks = async (req, res) => {
	try {
		const feedbacks = await Feedback.find().populate("user_id", "username email");
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: "Lỗi server khi lấy feedbacks", error });
	}
};

// [POST] /api/feedbacks - Thêm feedback mới
exports.createFeedback = async (req, res) => {
	try {
		const { user_id, name, email, phone_number, content } = req.body;
		console.log("feedback", req.body);
		if (!user_id || !name || !email || !phone_number || !content) {
			console.log(!user_id, !name, !email, !phone_number, !content);
			return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
		}
		const newFeedback = new Feedback({
			user_id,
			name,
			email,
			phone_number,
			content,
		});

		const savedFeedback = await newFeedback.save();
		res.status(201).json(savedFeedback);
	} catch (error) {
		res.status(400).json({ message: "Tạo feedback thất bại", error });
	}
};

// [PUT] /api/feedbacks/:id - Cập nhật feedback
exports.updateFeedback = async (req, res) => {
	try {
		const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!updated) return res.status(404).json({ message: "Feedback không tồn tại" });
		res.status(200).json(updated);
	} catch (error) {
		res.status(400).json({ message: "Cập nhật thất bại", error });
	}
};

// [DELETE] /api/feedbacks/:id - Xóa feedback
exports.deleteFeedback = async (req, res) => {
	try {
		const deleted = await Feedback.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: "Feedback không tồn tại" });
		res.status(200).json({ message: "Đã xóa feedback thành công" });
	} catch (error) {
		res.status(400).json({ message: "Xóa thất bại", error });
	}
};
