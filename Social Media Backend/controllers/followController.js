const Follow = require("../models/follow");
const User = require("../models/user");

exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; 
    const currentUserId = req.user._id; 

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const newFollow = new Follow({
      follower: currentUserId,
      following: targetUserId,
    });

    await newFollow.save();

    return res.status(200).json({ message: "Successfully followed user" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "You are already following this user" });
    }
    return res.status(400).json({ error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const deletionResult = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!deletionResult) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    return res.status(200).json({ message: "Successfully unfollowed user" });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
