const express = require("express");
const router = express.Router();

const followController = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:id/follow", protect, followController.followUser);
router.delete("/:id/follow", protect, followController.unfollowUser);

module.exports = router;
