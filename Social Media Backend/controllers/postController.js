const Post = require("../models/post");
const Like = require("../models/like");

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const newPost = new Post({
      title,
      content,
      tags,
      author: req.user._id,
    });
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not the owner of this post" });
    }

    const { title, content, tags, state } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (state !== undefined) post.state = state;

    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not the owner of this post" });
    }

    await post.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getPublishedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let queryCondition = { state: "published" };

    if (req.query.tag) {
      queryCondition.tags = req.query.tag;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      queryCondition.$or = [
        { title: searchRegex },
        { tags: searchRegex },
      ];
    }

    const allowedSorts = ["timestamp", "createdAt", "like_count", "comment_count"];
    let sortField = req.query.sort || "createdAt";
    if (sortField === "timestamp") sortField = "createdAt";
    if (!allowedSorts.includes(sortField)) sortField = "createdAt";

    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find(queryCondition)
      .populate("author", "first_name last_name username")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(queryCondition);

    return res.status(200).json({
      data: posts,
      page,
      limit,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "first_name last_name username"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.state === "draft") {
      const isOwner = req.user && req.user._id.toString() === post.author._id.toString();
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: This post is a draft" });
      }
    }

    let likedByMe = null;
    if (req.user) {
      const likeDoc = await Like.findOne({ post: post._id, user: req.user._id });
      likedByMe = !!likeDoc;
    }

    const postJson = post.toJSON();
    postJson.liked_by_me = likedByMe;

    return res.status(200).json(postJson);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};