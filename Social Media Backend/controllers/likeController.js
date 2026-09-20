const Like = require("../models/like");
const Post = require("../models/post");

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newLike = new Like({
      post: postId,
      user: userId,
    });

    await newLike.save();

    post.like_count += 1;
    await post.save();

    return res.status(201).json({
      liked: true,
      like_count: post.like_count,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already liked this post" });
    }
    return res.status(400).json({ error: error.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const deletedLike = await Like.findOneAndDelete({
      post: postId,
      user: userId,
    });

    if (!deletedLike) {
      return res.status(400).json({ error: "You have not liked this post yet" });
    }

    if (post.like_count > 0) {
      post.like_count -= 1;
      await post.save();
    }

    return res.status(200).json({
      liked: false,
      like_count: post.like_count,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};