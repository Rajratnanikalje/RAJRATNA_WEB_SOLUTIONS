import Enquiry from "../models/Enquiry.js";

export const create = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required" });
  }
  if (name.length > 100 || email.length > 254 || phone.length > 30 || message.length > 5000) {
    return res.status(422).json({ message: "One or more fields exceed the allowed length" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ message: "Please enter a valid email address" });
  }

  const enquiry = await Enquiry.create({ name, email, phone, message });
  res.status(201).json({ data: enquiry });
};

export const list = async (req, res) => {
  res.json({ data: await Enquiry.find().sort({ createdAt: -1 }) });
};

export const update = async (req, res) => {
  const x = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!x) return res.status(404).json({ message: "Enquiry not found" });
  res.json({ data: x });
};

export const del = async (req, res) => {
  const x = await Enquiry.findByIdAndDelete(req.params.id);
  if (!x) return res.status(404).json({ message: "Enquiry not found" });
  res.json({ message: "Deleted" });
};
