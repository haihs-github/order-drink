const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category", // Tham chiếu đến model Category
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Giá không thể âm
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // Giảm giá tối đa 100% (tùy chọn)
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
