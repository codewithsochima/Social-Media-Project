const express = require("express");
const router = express.Router();

const likeController = require("../controllers/likeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:id", protect, likeController.likePost);

router.delete("/:id", protect, likeController.unlikePost);

module.exports = router;
