// import models
const Product = require("../models/Product");
const Category = require("../models/Category");

const cloudinary = require("../config/cloudinary");
const fs = require("fs"); // Thư viện để làm việc với hệ thống file

// Middleware của multer để xử lý tải lên một file duy nhất với tên trường là 'thumbnail'
const upload = require("multer")({ dest: "uploads/" });

// Lấy tất cả sản phẩm (có thể có phân trang, tìm kiếm, lọc)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category_id", "name");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm một sản phẩm mới
exports.createProduct = [
  upload.single("thumbnail"), // Sử dụng middleware multer trước controller
  async (req, res) => {
    try {
      const { category, title, price, discount, description } = req.body;
      if (!category?.trim() || !title?.trim() || !description?.trim()) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin sản phẩm." });
      }
      const existingCategory = await Category.findOne({ name: category });
      let categoryId;

      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        const newCategory = new Category({ name: category });
        const savedCategory = await newCategory.save();
        categoryId = savedCategory._id;
      }

      let thumbnailUrl = null;
      if (req.file) {
        // Tải file lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        thumbnailUrl = result.secure_url;

        // Xóa file tạm sau khi tải lên Cloudinary
        fs.unlinkSync(req.file.path);
      }

      const newProduct = new Product({
        category_id: categoryId,
        title: title,
        price: price,
        discount: discount,
        thumbnail: thumbnailUrl, // Lưu URL từ Cloudinary
        description: description,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      res.status(400).json({ message: error.message });
    }
  },
];

// Sửa một sản phẩm theo ID
exports.updateProduct = [
  upload.single("thumbnail"), // Middleware để xử lý file tải lên
  async (req, res) => {
    try {
      const { category, title, price, discount, description } = req.body;
      if (
        !category?.trim() ||
        !title?.trim() ||
        !price?.trim() ||
        !discount?.trim() ||
        !description?.trim()
      ) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin sản phẩm." });
      }
      const productId = req.params.id;

      // Kiểm tra xem sản phẩm có tồn tại không trước khi cập nhật.
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
      }

      let thumbnailUrl = existingProduct.thumbnail; // Giữ nguyên URL cũ

      if (req.file) {
        // Nếu có file mới được tải lên, tải lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        thumbnailUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      }
      // Nếu không có category trong req.body, giữ nguyên category cũ
      const categoryId = category
        ? (
            (await Category.findOne({ name: category })) ||
            (await new Category({ name: category }).save())
          )._id
        : existingProduct.category_id;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          category_id: categoryId,
          title: title,
          price: price,
          discount: discount,
          thumbnail: thumbnailUrl, // Sử dụng URL mới hoặc cũ
          description: description,
        },
        { new: true }
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      res.status(400).json({ message: error.message });
    }
  },
];

// Xóa một sản phẩm theo ID (soft delete)
exports.softDeleteProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa" });
    }
    res.status(200).json({ message: "Sản phẩm đã được xóa (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa vĩnh viễn một sản phẩm theo ID (cẩn trọng khi sử dụng)
exports.hardDeleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa vĩnh viễn" });
    }
    res.status(200).json({ message: "Sản phẩm đã bị xóa vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
