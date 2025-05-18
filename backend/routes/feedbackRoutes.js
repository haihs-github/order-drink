const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

//middleware 
const { verifyToken, isAdmin } = require("../middlewares/auth");

// CRUD routes
router.get("/", verifyToken, isAdmin, feedbackController.getAllFeedbacks);
router.post("/", verifyToken, feedbackController.createFeedback);
// router.put("/:id", feedbackController.updateFeedback);
// router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
