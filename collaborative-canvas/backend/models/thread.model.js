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
    username: { type: String, required: true},
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      default: null  // Null if it's a top-level comment
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
    position: {  
        x: { type: Number, default: null },  
        y: { type: Number, default: null }  
      },
  },
  { timestamps: true }
);

const Thread = mongoose.model("Thread", ThreadSchema);

module.exports = Thread;
