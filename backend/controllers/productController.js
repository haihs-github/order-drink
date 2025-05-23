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

// Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    // Tìm các sản phẩm có category_id trùng với id của category vừa tìm được
    const products = await Product.find({ category_id: category, deleted: false })
      .populate("category_id", "name"); // Lấy cả tên danh mục

    if (!products || products.length === 0) {
      return res.status(200).json({ message: "Không có sản phẩm nào trong danh mục này", products: [] }); // trả về 200 và mảng rỗng
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy sản phẩm" });
  }
};

// Thêm một sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { category, title, price, discount, description, thumbnail } = req.body;
    const thumbnailpath = req.file?.path || thumbnail;

    if (!category?.trim() || !title?.trim() || !description?.trim() || !thumbnailpath) {
      console.log(discount, category, title, description, thumbnailpath,)
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

    const newProduct = new Product({
      category_id: categoryId,
      title: title,
      price: price,
      discount: discount,
      thumbnail: thumbnailpath, // Lưu URL từ Cloudinary
      description: description,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(400).json({ message: error.message });
  }
};

// Sửa một sản phẩm theo ID
exports.updateProduct = async (req, res) => {
  try {
    const { category, title, price, discount, description, thumbnail } = req.body;

    // Dùng ảnh mới nếu có upload, nếu không dùng ảnh cũ từ body
    const thumbnailpath = req.file?.path || thumbnail;

    if (
      !category?.trim() ||
      !title?.trim() ||
      !price?.trim() ||
      !discount?.trim() ||
      !description?.trim() ||
      !thumbnailpath
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
        thumbnail: thumbnailpath, // Sử dụng URL mới hoặc cũ
        description: description,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(400).json({ message: error.message });
  }
};

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
