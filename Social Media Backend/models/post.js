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
      ref: "User",
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

PostSchema.virtual("timestamp").get(function () {
  return this.createdAt;
});

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);