import mongoose from "mongoose";
export default mongoose.model(
  "Admin",
  new mongoose.Schema(
    {
      email: { type: String, unique: true, required: true, lowercase: true },
      password: { type: String, required: true },
      active: { type: Boolean, default: true },
      passwordResetToken: { type: String, select: false },
      passwordResetExpires: { type: Date, select: false },
    },
    { timestamps: true },
  ),
);
