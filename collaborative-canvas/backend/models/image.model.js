const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
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
            ref: 'Keyword',
        },
    ],
    feedback:[
          {
            userId: { type: String},
            username: { type: String, required: true },
            boardId: {type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true},
            message: { type: String }, // Regular text message
            keywordType: {type: String},
            keyword: { type: String},
            timestamp: { type: Date, default: Date.now },
          }
        ]
  },
  { timestamps: true, }
);

imageSchema.index({ boardId: 1 });

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
