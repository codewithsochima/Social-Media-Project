const User = require("../models/user");
const Post = require("../models/post");
const Follow = require("../models/follow");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingCount = await Follow.countDocuments({ follower: user._id });
    const followersCount = await Follow.countDocuments({ following: user._id });
    const postsCount = await Post.countDocuments({ author: user._id });

    return res.status(200).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      following_count: followingCount,
      followers_count: followersCount,
      posts_count: postsCount,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingCount = await Follow.countDocuments({ follower: targetUserId });

    const followersCount = await Follow.countDocuments({ following: targetUserId });

    let isFollowing = false;
    if (req.user) {
      const followCheck = await Follow.findOne({
        follower: req.user._id,
        following: targetUserId,
      });
      isFollowing = !!followCheck;
    }

    return res.status(200).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      following_count: followingCount,
      followers_count: followersCount,
      is_following: isFollowing,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};