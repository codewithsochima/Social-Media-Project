const User = require("../models/user");
const Post = require("../models/post");
const Follow = require("../models/follow");

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
        following: targetUserId
      });
      isFollowing = !!followCheck; // Converts into a flat true or false flag variable
    }

    return res.status(200).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      following_count: followingCount,  // Matches profile.js line 24
      followers_count: followersCount,  // Matches profile.js line 25
      is_following: isFollowing        // Matches profile.js line 41
    });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
