import mongoose from "mongoose";
export default mongoose.model(
  "Admin",
  new mongoose.Schema(
    {
      email: { type: String, unique: true, required: true, lowercase: true },
      password: { type: String, required: true },
      active: { type: Boolean, default: true },
      passwordResetOtpHash: { type: String, select: false },
      passwordResetOtpExpires: { type: Date, select: false },
      passwordResetOtpAttempts: { type: Number, default: 0, select: false },
      passwordResetOtpSentAt: { type: Date, select: false },
      passwordResetTokenHash: { type: String, select: false },
      passwordResetTokenExpires: { type: Date, select: false },
    },
    { timestamps: true },
  ),
);
