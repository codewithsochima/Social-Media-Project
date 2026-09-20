const express = require("express");
const router = express.Router();

const followController = require("../controllers/followController");
const userController = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware");

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization) {
    await protect(req, res, next);
  } else {
    next();
  }
};

router.get("/me", protect, userController.getCurrentUser);

router.get("/:id", optionalProtect, userController.getUserProfile);

router.post("/:id/follow", protect, followController.followUser);
router.delete("/:id/follow", protect, followController.unfollowUser);

router.get(
  "/:id/posts",
  async (req, res, next) => {
    if (req.headers.authorization) {
      const { protect } = require("../middleware/authMiddleware");
      return protect(req, res, next);
    }
    next();
  },
  async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const stateQuery = req.query.state;

      let queryCondition = { author: targetUserId };

      if (stateQuery && stateQuery.trim() !== "") {
        queryCondition.state = stateQuery;

        if (stateQuery === "draft") {
          if (!req.user || req.user._id.toString() !== targetUserId.toString()) {
            return res
              .status(403)
              .json({ error: "Forbidden: You cannot view another user's drafts" });
          }
        }
      } else {
        if (!req.user || req.user._id.toString() !== targetUserId.toString()) {
          queryCondition.state = "published";
        }
      }

      const Post = require("../models/post");
      const posts = await Post.find(queryCondition)
        .populate("author", "first_name last_name username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPosts = await Post.countDocuments(queryCondition);

      const formattedPosts = posts.map((post) => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          state: post.state,
          like_count: post.like_count,
          comment_count: post.comment_count,
          timestamp: post.createdAt,
        };
      });

      return res.status(200).json({
        data: formattedPosts,
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;