const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//middlewaremiddleware
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Lấy tất cả người dùng
router.get("", userController.getAllUsers);

// Lấy một uer theo ID
router.get("/:id", userController.getUserById);

// // Sửa một sản phẩm theo ID
// router.put("/:id", verifyToken, isAdmin, userController.updateUser);

// Sửa một sản phẩm theo ID
router.put(
	"/:id",
	// verifyToken,
	// isAdmin,
	userController.updateUser
);

// Xóa một sản phẩm theo ID (soft delete)
router.delete(
	"/:id",
	// verifyToken,
	// isAdmin,
	userController.softDeleteUser
);

module.exports = router;
