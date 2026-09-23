import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpLifetimeMs = 10 * 60 * 1000;
const resetTokenLifetimeMs = 10 * 60 * 1000;
const resendCooldownMs = 60 * 1000;
const maximumOtpAttempts = 5;
const genericResetMessage = "If this email belongs to an active admin account, an OTP has been sent.";
const hashOtp = (otp) => crypto.createHmac("sha256", process.env.JWT_SECRET).update(otp).digest("hex");
const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const clearOtp = (admin) => {
  admin.passwordResetOtpHash = undefined;
  admin.passwordResetOtpExpires = undefined;
  admin.passwordResetOtpAttempts = 0;
  admin.passwordResetOtpSentAt = undefined;
};
const clearResetToken = (admin) => {
  admin.passwordResetTokenHash = undefined;
  admin.passwordResetTokenExpires = undefined;
};
const hasSmtpConfiguration = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
const getMailTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) return res.status(401).json({ message: "Admin account not found" });
  if (!admin.active) return res.status(401).json({ message: "Admin account inactive" });
  if (!await bcrypt.compare(password, admin.password)) return res.status(401).json({ message: "Admin password mismatch" });
  res.json({ token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "2h" }) });
}

export async function updateAccount(req, res) {
  const email = String(req.body.email || "").toLowerCase().trim();
  const newPassword = String(req.body.newPassword || "");
  const resetToken = String(req.body.resetToken || "");
  if (email && !emailPattern.test(email)) return res.status(422).json({ message: "Please enter a valid email address" });
  if (newPassword && newPassword.length < 8) return res.status(422).json({ message: "New password must be at least 8 characters" });
  if (!email && !newPassword) return res.status(400).json({ message: "Enter a new email or password" });
  if (!/^[a-f0-9]{64}$/i.test(resetToken)) return res.status(401).json({ message: "Verify the email OTP before updating your account." });
  const admin = await Admin.findOne({ _id: req.admin._id, passwordResetTokenHash: hashResetToken(resetToken), passwordResetTokenExpires: { $gt: new Date() }, active: true }).select("+passwordResetTokenHash +passwordResetTokenExpires");
  if (!admin) return res.status(401).json({ message: "Your OTP verification has expired. Please request a new OTP." });
  if (email && email !== admin.email) {
    if (await Admin.exists({ email, _id: { $ne: admin._id } })) return res.status(409).json({ message: "That email address is already in use" });
    admin.email = email;
  }
  if (newPassword) admin.password = await bcrypt.hash(newPassword, 12);
  clearResetToken(admin);
  clearOtp(admin);
  await admin.save();
  res.json({ message: "Admin account updated. Please sign in again." });
}

// Settings requests the OTP only for the authenticated admin's registered email.
export async function requestAccountUpdateOtp(req, res) {
  req.body = { email: req.admin.email };
  return requestPasswordReset(req, res);
}

export async function verifyAccountUpdateOtp(req, res) {
  req.body = { email: req.admin.email, otp: req.body.otp };
  return verifyPasswordResetOtp(req, res);
}

export async function requestPasswordReset(req, res) {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!emailPattern.test(email)) return res.status(422).json({ message: "Please enter a valid email address." });
  if (!hasSmtpConfiguration()) return res.status(503).json({ message: "Password reset email is not configured yet." });
  const admin = await Admin.findOne({ email, active: true }).select("+passwordResetOtpSentAt");
  if (!admin) return res.json({ message: genericResetMessage, resendAfter: 60 });

  const elapsed = admin.passwordResetOtpSentAt ? Date.now() - admin.passwordResetOtpSentAt.getTime() : resendCooldownMs;
  if (elapsed < resendCooldownMs) return res.status(429).json({ message: "Please wait before requesting another OTP.", retryAfter: Math.ceil((resendCooldownMs - elapsed) / 1000) });

  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  admin.passwordResetOtpHash = hashOtp(otp);
  admin.passwordResetOtpExpires = new Date(Date.now() + otpLifetimeMs);
  admin.passwordResetOtpAttempts = 0;
  admin.passwordResetOtpSentAt = new Date();
  clearResetToken(admin);
  await admin.save();
  try {
    await getMailTransport().sendMail({
      from: process.env.SMTP_FROM,
      to: admin.email,
      subject: "Your RAJRATNA WEB SOLUTIONS password reset OTP",
      text: `RAJRATNA WEB SOLUTIONS\n\nPassword Reset OTP: ${otp}\n\nThis OTP expires in 10 minutes. If you did not request this, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;background:#040711;padding:32px;color:#e7eefc"><div style="max-width:520px;margin:auto;background:#10182b;border:1px solid #29436f;border-radius:16px;padding:32px"><p style="color:#9fc2ff;letter-spacing:2px;font-size:12px">RAJRATNA WEB SOLUTIONS</p><h1 style="font-size:24px;color:#fff">Password Reset OTP</h1><p>Use this one-time code to reset your admin password:</p><div style="margin:24px 0;padding:18px;text-align:center;border-radius:12px;background:#0c1425;color:#9fc2ff;font-size:30px;letter-spacing:8px;font-weight:bold">${otp}</div><p>This OTP expires in <strong>10 minutes</strong>.</p><p style="color:#a7b9d8;font-size:13px">If you did not request this, you can safely ignore this email.</p></div></div>`,
    });
  } catch (error) {
    clearOtp(admin);
    await admin.save();
    console.error("Password reset email could not be sent:", error.message);
    return res.status(503).json({ message: "Password reset email could not be sent. Please try again later." });
  }
  res.json({ message: genericResetMessage, resendAfter: 60 });
}

export async function verifyPasswordResetOtp(req, res) {
  const email = String(req.body.email || "").toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();
  if (!emailPattern.test(email) || !/^\d{6}$/.test(otp)) return res.status(422).json({ message: "Enter a valid email address and 6-digit OTP." });
  const admin = await Admin.findOne({ email, active: true }).select("+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts +passwordResetOtpSentAt");
  if (!admin || !admin.passwordResetOtpHash || !admin.passwordResetOtpExpires || admin.passwordResetOtpExpires <= new Date()) return res.status(400).json({ message: "This OTP is invalid or has expired. Please request a new one." });
  if (admin.passwordResetOtpAttempts >= maximumOtpAttempts) {
    clearOtp(admin);
    await admin.save();
    return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP." });
  }
  const receivedHash = hashOtp(otp);
  const valid = crypto.timingSafeEqual(Buffer.from(receivedHash, "hex"), Buffer.from(admin.passwordResetOtpHash, "hex"));
  if (!valid) {
    admin.passwordResetOtpAttempts += 1;
    const locked = admin.passwordResetOtpAttempts >= maximumOtpAttempts;
    if (locked) clearOtp(admin);
    await admin.save();
    return res.status(locked ? 429 : 400).json({ message: locked ? "Too many incorrect attempts. Please request a new OTP." : "Incorrect OTP. Please try again." });
  }
  clearOtp(admin);
  const resetToken = crypto.randomBytes(32).toString("hex");
  admin.passwordResetTokenHash = hashResetToken(resetToken);
  admin.passwordResetTokenExpires = new Date(Date.now() + resetTokenLifetimeMs);
  await admin.save();
  res.json({ resetToken, message: "OTP verified. Choose your new password." });
}

export async function resetPassword(req, res) {
  const resetToken = String(req.body.resetToken || "");
  const password = String(req.body.password || "");
  if (!/^[a-f0-9]{64}$/i.test(resetToken)) return res.status(400).json({ message: "Password reset authorization is invalid or expired." });
  if (password.length < 8) return res.status(422).json({ message: "New password must be at least 8 characters." });
  const admin = await Admin.findOne({ passwordResetTokenHash: hashResetToken(resetToken), passwordResetTokenExpires: { $gt: new Date() }, active: true }).select("+passwordResetTokenHash +passwordResetTokenExpires");
  if (!admin) return res.status(400).json({ message: "Password reset authorization is invalid or expired." });
  admin.password = await bcrypt.hash(password, 12);
  clearResetToken(admin);
  clearOtp(admin);
  await admin.save();
  res.json({ message: "Password reset successfully. You can now sign in." });
}
