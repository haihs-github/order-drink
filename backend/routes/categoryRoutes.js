const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

//middlewaremiddleware
const { verifyToken, isAdmin } = require("../middlewares/auth");

// lấy tất cả danh sách category
router.get("", categoryController.getAllCategorys);

module.exports = router;