// image.model.js
/**
 * @file Image Mongoose model definition (ESM compatible)
 */

import mongoose from 'mongoose';

/**
 * Mongoose schema definition for images.
 */
const imageSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    filename: {
      type: String,
      required: false, // optional field
      default: "",     // ensures field is omitted if not provided
    },
    url: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    keywords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Keyword",
      },
    ],
  },
  { timestamps: true }
);

imageSchema.index({ boardId: 1 });

/**
 * The Image model based on imageSchema.
 * @type {mongoose.Model}
 */
const Image = mongoose.model("Image", imageSchema);

export default Image;