import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resetLifetimeMs = 15 * 60 * 1000;
const hasSmtpConfiguration = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
const getMailTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
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

export async function requestPasswordReset(req, res) {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!emailPattern.test(email)) return res.status(422).json({ message: "Please enter a valid email address." });
  if (!hasSmtpConfiguration()) return res.status(503).json({ message: "Password reset email is not configured yet." });

  const admin = await Admin.findOne({ email, active: true });
  if (!admin) return res.json({ message: "If this email belongs to an active admin account, a reset link has been sent." });

  const token = crypto.randomBytes(32).toString("hex");
  admin.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  admin.passwordResetExpires = new Date(Date.now() + resetLifetimeMs);
  await admin.save();

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
  const resetUrl = `${clientUrl}/admin/reset-password?token=${token}`;
  try {
    await getMailTransport().sendMail({
      from: process.env.SMTP_FROM,
      to: admin.email,
      subject: "Reset your RAJRATNA WEB SOLUTIONS admin password",
      text: `A password reset was requested for your admin account. Open this link within 15 minutes: ${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    });
  } catch (error) {
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
    console.error("Password reset email could not be sent:", error.message);
    return res.status(503).json({ message: "Password reset email could not be sent. Please try again later." });
  }
  res.json({ message: "If this email belongs to an active admin account, a reset link has been sent." });
}

export async function resetPassword(req, res) {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ message: "This reset link is invalid or has expired." });
  if (password.length < 8) return res.status(422).json({ message: "New password must be at least 8 characters." });

  const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  const admin = await Admin.findOne({ passwordResetToken, passwordResetExpires: { $gt: new Date() }, active: true }).select("+passwordResetToken +passwordResetExpires");
  if (!admin) return res.status(400).json({ message: "This reset link is invalid or has expired." });

  admin.password = await bcrypt.hash(password, 12);
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();
  res.json({ message: "Password reset successfully. You can now sign in." });
}
