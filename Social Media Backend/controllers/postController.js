const Post = require("../models/post");

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
  try {    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden: You are not the owner of this post" });
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
      return res.status(403).json({ error: "Forbidden: You are not the owner of this post" });
    }

    await post.deleteOne();

    return res.status(204).send();

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getPublishedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ state: "published" }).sort({ createdAt: -1 });

    return res.status(200).json(posts);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "first_name last_name username");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};