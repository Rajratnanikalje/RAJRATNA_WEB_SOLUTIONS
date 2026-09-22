import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const a = await Admin.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!a) {
    return res.status(401).json({
      message: "Admin account not found",
    });
  }

  if (!a.active) {
    return res.status(401).json({
      message: "Admin account inactive",
    });
  }

  const passwordMatch = await bcrypt.compare(password, a.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Admin password mismatch",
    });
  }

  res.json({
    token: jwt.sign(
      { id: a._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    ),
  });
}

export async function updateAccount(req, res) {
  const currentPassword = String(req.body.currentPassword || "");
  const email = String(req.body.email || "").toLowerCase().trim();
  const newPassword = String(req.body.newPassword || "");
  if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(422).json({ message: "Please enter a valid email address" });
  if (newPassword && newPassword.length < 8) return res.status(422).json({ message: "New password must be at least 8 characters" });
  if (!email && !newPassword) return res.status(400).json({ message: "Enter a new email or password" });
  if (!await bcrypt.compare(currentPassword, req.admin.password)) return res.status(401).json({ message: "Current password is incorrect" });
  if (email && email !== req.admin.email) {
    if (await Admin.exists({ email, _id: { $ne: req.admin._id } })) return res.status(409).json({ message: "That email address is already in use" });
    req.admin.email = email;
  }
  if (newPassword) req.admin.password = await bcrypt.hash(newPassword, 12);
  await req.admin.save();
  res.json({ message: "Admin account updated. Please sign in again." });
}
