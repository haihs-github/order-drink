const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const upload = require("../middlewares/upload");


// Tạo tin tức
router.post("/", upload.single("thumbnail"), newsController.createNews);

// Lấy tất cả tin tức
router.get("/", newsController.getAllNews);

// Lấy tin tức theo ID
router.get("/:id", newsController.getNewsById);

// Cập nhật tin tức
router.put("/:id", upload.single('thumbnail'), newsController.updateNews);

// Xoá tin tức
router.delete("/:id", newsController.deleteNews);

module.exports = router;
