import mongoose from 'mongoose';

// Define the iteration subdocument schema for clarity
const iterationSchema = new mongoose.Schema(
  {
    prompt: [{ type: String }],
    generatedImages: [{ type: String }], // Array of image URLs
    keywords: [
      {
        keyword: { type: String, required: true },
        type: { type: String, required: true },
        vote: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const boardSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
    keywords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Keyword',
      },
    ],
    iterations: [iterationSchema],
    isVoting: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

boardSchema.index({ roomId: 1 });

/**
 * Board model
 * @type {mongoose.Model}
 */
const Board = mongoose.model('Board', boardSchema);
export default Board;