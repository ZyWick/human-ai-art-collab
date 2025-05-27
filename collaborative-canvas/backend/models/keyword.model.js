const mongoose = require("mongoose");

const keywordSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    offsetX: {
      type: Number,
    },
    offsetY: {
      type: Number,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
    keyword: {
      type: String,
      required: true,
    },
    boundingBoxes: {
      type: [[Number]], // 2D array of numbers
      required: false, // optional field
      default: undefined, // ensures field is omitted if not provided
    },
    votes: {
      type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
      ref: "User",
      default: [], // Default to an empty array
    },
    downvotes: {
      type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
      ref: "User",
      default: [], // Default to an empty array
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

keywordSchema.index({ imageId: 1 });
keywordSchema.index({ boardId: 1, isSelected: 1 });

const Keyword = mongoose.model("Keyword", keywordSchema);

module.exports = Keyword;
