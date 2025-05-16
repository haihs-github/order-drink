const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// CRUD routes
router.get("/", feedbackController.getAllFeedbacks);
router.post("/", feedbackController.createFeedback);
router.put("/:id", feedbackController.updateFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
