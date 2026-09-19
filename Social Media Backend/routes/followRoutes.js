const express = require("express");
const router = express.Router();

const followController = require("../controllers/followController");
const userController = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware");

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization) {
    await protect(req, res, next);
  } else {
    // If they are a logged-out guest, just pass them forward cleanly!
    next();
  }
};

router.get("/:id", optionalProtect, userController.getUserProfile);

router.post("/:id/follow", protect, followController.followUser);
router.delete("/:id/follow", protect, followController.unfollowUser);

module.exports = router;
