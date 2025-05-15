const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { fullname, email, phone_number, address, username, password } =
      req.body;

    // Kiểm tra username/email đã tồn tại
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username hoặc Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      fullname,
      email,
      phone_number,
      address,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ message: "username hoặc mật khẩu không chính xác", ok: false });

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "username hoặc mật khẩu không chính xác", ok: false });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" }
    );

    // Trả về user (ẩn password)
    const { password: pwd, ...userInfo } = user._doc;

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: userInfo,
      ok: true,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập", ok: false });
  }
};

module.exports = { login, register };
