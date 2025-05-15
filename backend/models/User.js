const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: String,
  address: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  created_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
