import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  title: String,
  description: { type: String, required: true },
  fullDescription: String,
  technologies: [String],
  url: String,
  githubUrl: String,
  imageUrl: String,
  published: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Project", schema);
