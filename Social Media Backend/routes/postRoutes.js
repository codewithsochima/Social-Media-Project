const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, postController.createPost);

router.patch("/:id", protect, postController.updatePost);

router.delete("/:id", protect, postController.deletePost);

module.exports = router;
