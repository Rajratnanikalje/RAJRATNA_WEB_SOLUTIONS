import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required" });
    const d = jwt.verify(h.slice(7), process.env.JWT_SECRET),
      a = await Admin.findById(d.id);
    if (!a?.active) return res.status(401).json({ message: "Invalid session" });
    req.admin = a;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}
