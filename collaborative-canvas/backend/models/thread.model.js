const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null
    },
    keywordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Keyword",  // Fixed reference
      default: null
    },
    username: { 
      type: String, 
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      default: null  // Null for top-level comments
    },
    position: {  
      x: { type: Number, default: null },  
      y: { type: Number, default: null }  
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexing for faster queries
ThreadSchema.index({ boardId: 1 });
ThreadSchema.index({ imageId: 1 });
ThreadSchema.index({ keywordId: 1 });
ThreadSchema.index({ parentId: 1 });

const Thread = mongoose.model("Thread", ThreadSchema);

module.exports = Thread;
