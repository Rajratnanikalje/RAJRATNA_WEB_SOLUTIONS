import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
await connectDB();
const email = process.env.ADMIN_EMAIL?.toLowerCase().trim(),
  password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 10)
  throw new Error("Set ADMIN_EMAIL and a 10+ character ADMIN_PASSWORD");
const admin = (await Admin.findOne({ email })) || new Admin({ email });
admin.password = await bcrypt.hash(password, 12);
admin.active = true;
admin.sessionVersion = (admin.sessionVersion ?? 0) + 1;
await admin.save();
console.log("Admin ready:", email);
process.exit(0);
