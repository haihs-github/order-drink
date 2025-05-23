const News = require("../models/News");

// Thêm tin tức mới
exports.createNews = async (req, res) => {
	try {
		const { type, title, header, content, thumbnail } = req.body;
		// const thumbnailFile = req.file; // từ multer (đã upload cloudinary)
		const thumbnailpath = req.file?.path || thumbnail;

		if (!type || !title || !thumbnailpath) {
			console.log("Thiếu thông tin bắt buộc", thumbnail);
			return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
		}

		const newNews = new News({
			type,
			title,
			header,
			content,
			thumbnail: thumbnailpath, // Đường dẫn đến ảnh đã upload
		});

		const savedNews = await newNews.save();
		res.status(201).json(savedNews);
	} catch (error) {
		console.error("Lỗi khi tạo tin tức:", error);
		res.status(500).json({ message: "Tạo tin tức thất bại", error });
	}
};

// Lấy tất cả tin tức
exports.getAllNews = async (req, res) => {
	try {
		const newsList = await News.find().sort({ createdAt: -1 });
		res.status(200).json(newsList);
	} catch (error) {
		res.status(500).json({ message: "Không thể lấy danh sách tin tức", error });
	}
};

// Lấy tin tức theo ID
exports.getNewsById = async (req, res) => {
	try {
		const news = await News.findById(req.params.id);
		if (!news) return res.status(404).json({ message: "Không tìm thấy tin tức" });
		res.status(200).json(news);
	} catch (error) {
		res.status(500).json({ message: "Không thể lấy tin tức", error });
	}
};

// Cập nhật tin tức
exports.updateNews = async (req, res) => {
	try {
		const { type, title, header, content, thumbnail } = req.body;

		// Dùng ảnh mới nếu có upload, nếu không dùng ảnh cũ từ body
		const thumbnailpath = req.file?.path || thumbnail;

		// Kiểm tra bắt buộc
		if (!type || !title || !thumbnailpath) {
			return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
		}

		// Tạo object chứa dữ liệu cần cập nhật
		const updatedFields = {
			type,
			title,
			header,
			content,
			thumbnail: thumbnailpath,
		};

		// Cập nhật bản ghi
		const updatedNews = await News.findByIdAndUpdate(
			req.params.id,
			updatedFields,
			{ new: true }
		);

		if (!updatedNews) {
			return res.status(404).json({ message: "Không tìm thấy tin tức để cập nhật" });
		}

		res.status(200).json(updatedNews);
	} catch (error) {
		console.error("Lỗi khi cập nhật tin tức:", error);
		res.status(500).json({ message: "Cập nhật tin tức thất bại", error });
	}
};


// Xóa tin tức
exports.deleteNews = async (req, res) => {
	try {
		const deletedNews = await News.findByIdAndDelete(req.params.id);
		if (!deletedNews) {
			return res.status(404).json({ message: "Không tìm thấy tin tức để xóa" });
		}
		res.status(200).json({ message: "Đã xóa tin tức thành công" });
	} catch (error) {
		res.status(500).json({ message: "Xóa tin tức thất bại", error });
	}
};
