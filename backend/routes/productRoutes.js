const express = require("express");
const router = express.Router();
const productController = require("..//controllers/productController");

//middlewaremiddleware
const { verifyToken, isAdmin } = require("../middlewares/auth");

// const multer = require("multer"); // Import multer
const upload = require("../middlewares/upload");

// const upload = multer({ dest: "uploads/" }); // Cấu hình multer

// Lấy tất cả sản phẩm
router.get("", productController.getAllProducts);

// Lấy một sản phẩm theo ID
router.get("/:id", productController.getProductById);

//lấy sản phẩm theo tên danh mục
router.get("/category/:category", productController.getProductsByCategory);

// Thêm một sản phẩm mới
router.post(
  "",
  // verifyToken,
  // isAdmin,
  upload.single("thumbnail"),
  productController.createProduct
);

// Sửa một sản phẩm theo ID
router.put("/:id",
  // verifyToken, isAdmin,
  upload.single("thumbnail"),
  productController.updateProduct
);

// Xóa một sản phẩm theo ID (soft delete)
router.delete(
  "/:id",
  // verifyToken,
  // isAdmin,
  productController.softDeleteProduct
);

// Xóa vĩnh viễn một sản phẩm theo ID (cẩn trọng)
router.delete(
  "/hard/:id",
  verifyToken,
  isAdmin,
  productController.hardDeleteProduct
);

module.exports = router;
