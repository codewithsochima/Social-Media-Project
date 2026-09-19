const express = require("express");
const router = express.Router();

const followController = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:id", protect, followController.followUser);

router.delete("/:id", protect, followController.unfollowUser);

module.exports = router;
