const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "post title is required"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    like_count: {
      type: Number,
      default: 0,
    },

    comment_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", PostSchema);