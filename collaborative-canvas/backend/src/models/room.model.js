// Importing mongoose using ESM `import` syntax
import mongoose from 'mongoose';

/**
 * RoomSchema defines the structure of Room documents in MongoDB.
 * - name: String (required)
 * - boards: Array of ObjectIds referencing Board
 * - joinCode: String (required)
 * - designDetails: Nested objective string (default: "")
 */
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
    },
  },
  { timestamps: true }
);

// Create the Room model from the schema
const Room = mongoose.model('Room', RoomSchema);
export default Room;