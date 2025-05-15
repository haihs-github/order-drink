const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    },
  },
  {
    timestamps: false, // Không cần timestamps cho category dựa trên schema SQL
  }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
