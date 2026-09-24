import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, maxlength: 30 },
  company: { type: String, maxlength: 120 },
  service: { type: String, maxlength: 100 },
  budget: { type: String, maxlength: 80 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ["New", "In Progress", "Resolved", "NEW", "CONTACTED", "DISCUSSION", "QUOTED", "CONVERTED", "CLOSED"], default: "New" },
  internalNote: { type: String, maxlength: 5000 },
}, { timestamps: true });

schema.index({ createdAt: -1 });
export default mongoose.model("Enquiry", schema);
