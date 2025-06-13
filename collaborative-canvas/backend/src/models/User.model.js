import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Export the Mongoose model as default
export default mongoose.model("User", userSchema);