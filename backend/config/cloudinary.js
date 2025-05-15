const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dqjlwwyci", // Thay bằng cloud name của bạn
  api_key: "985346833942949", // Thay bằng API key của bạn
  api_secret: "C5nQ28OUEc28tZ512Ecm4NRyBPM", // Thay bằng API secret của bạn
});

module.exports = cloudinary;
