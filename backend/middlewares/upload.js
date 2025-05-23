// middlewares/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "news_thumbnails",
		allowed_formats: ["jpg", "jpeg", "png"],
	},
});

const upload = multer({ storage: storage });
module.exports = upload;
