import mongoose from "mongoose";
export default mongoose.model(
  "Admin",
  new mongoose.Schema(
    {
      email: { type: String, unique: true, required: true, lowercase: true },
      password: { type: String, required: true },
      active: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
