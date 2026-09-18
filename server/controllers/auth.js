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