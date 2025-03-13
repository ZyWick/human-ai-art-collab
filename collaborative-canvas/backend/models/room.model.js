const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    boards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
      },
    ],
    joinCode: {
      type: String,
      required: true,
    },
    designDetails: {
      objective: { type: String, default: "" },
      targetAudience: { type: String, default: "" },
      outcomes: { type: String, default: "" },
      whatSetsUsApart: { type: String, default: "" },
      constraints: { type: String, default: "" },
      others: { type: String, default: "" },
    },
    roomChat: [
      {
        userId: { type: String},
        username: { type: String, required: true },
        boardId: {type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true},
        message: { type: String }, // Regular text message
        timestamp: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
