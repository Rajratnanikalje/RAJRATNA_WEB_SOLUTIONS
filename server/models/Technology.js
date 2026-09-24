import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  category: String,
  iconUrl: String,
  published: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Technology", schema);
