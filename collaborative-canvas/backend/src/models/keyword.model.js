import mongoose from 'mongoose';

/**
 * Keyword Schema for MongoDB with Mongoose.
 * Represents a keyword entity linked to a board and optionally an image.
 * Includes selection state, custom flag, type, keyword string, bounding boxes, votes, and timestamps.
 */
const keywordSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
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
      ref: 'User',
      default: [],
    },
    downvotes: {
      type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
      ref: 'User',
      default: [],
    },
    author: {
      type: String 
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create compound indexes for the Keyword model
keywordSchema.index({ imageId: 1 });

/**
 * Keyword model.
 * @type {import('mongoose').Model}
 */
const Keyword = mongoose.model('Keyword', keywordSchema);
export default Keyword;