const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const upload = require("../middlewares/upload");

const { verifyToken, isAdmin } = require("../middlewares/auth");

// Tạo tin tức
router.post("/", verifyToken, isAdmin, upload.single("thumbnail"), newsController.createNews);

// Lấy tất cả tin tức
router.get("/", newsController.getAllNews);

// Lấy tin tức theo ID
router.get("/:id", newsController.getNewsById);

// Cập nhật tin tức
router.put("/:id", verifyToken, isAdmin, upload.single('thumbnail'), newsController.updateNews);

// Xoá tin tức
router.delete("/:id", verifyToken, isAdmin, newsController.deleteNews);

module.exports = router;
