// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// routes
// api dang ky dang nhap
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//import middleware
const { verifyToken, isAdmin } = require("./middlewares/auth");

//use routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Kết nối MongoDB và khởi động server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
      console.log(`mongo connected`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
