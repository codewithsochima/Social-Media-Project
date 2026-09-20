const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const likeController = require("../controllers/likeController");

const { protect } = require("../middleware/authMiddleware");

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.get("/", postController.getPublishedPosts);

router.post("/", protect, postController.createPost);

router.get("/:id", optionalProtect, postController.getPostById);

router.patch("/:id", protect, postController.updatePost);

router.delete("/:id", protect, postController.deletePost);

router.post("/:id/like", protect, likeController.likePost);

router.delete("/:id/like", protect, likeController.unlikePost);

module.exports = router;