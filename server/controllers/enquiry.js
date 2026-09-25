import Enquiry from "../models/Enquiry.js";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (phone, country) => {
  const selectedCountry = String(country || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(selectedCountry)) return "";
  try {
    const parsed = parsePhoneNumberFromString(
      String(phone || "").trim(),
      selectedCountry,
    );
    return parsed?.isValid() && parsed.country === selectedCountry
      ? parsed.number
      : "";
  } catch {
    return "";
  }
};

const escapeTelegramHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const sendTelegramNotification = async (enquiry) => {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
  if (!token || !chatId) return;

  const dateTime = new Date(enquiry.createdAt || Date.now()).toLocaleString(
    "en-IN",
    { timeZone: "Asia/Kolkata" },
  );
  const details = [
    "🔔 <b>New Website Enquiry</b>",
    `\n<b>Name:</b> ${escapeTelegramHtml(enquiry.name)}`,
    `\n<b>Email:</b> ${escapeTelegramHtml(enquiry.email)}`,
    `\n<b>Phone:</b> ${escapeTelegramHtml(enquiry.phone)}`,
    `\n<b>Service:</b> ${escapeTelegramHtml(enquiry.service)}`,
    `\n<b>Message:</b> `,
  ];
  const ending = `\n<b>Date/Time:</b> ${escapeTelegramHtml(dateTime)}`;
  const messageBudget = Math.max(
    0,
    4095 - details.join("").length - ending.length,
  );
  const rawMessage = String(enquiry.message || "");
  let low = 0;
  let high = rawMessage.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (escapeTelegramHtml(rawMessage.slice(0, mid)).length <= messageBudget)
      low = mid;
    else high = mid - 1;
  }
  const message =
    escapeTelegramHtml(rawMessage.slice(0, low)) +
    (low < rawMessage.length ? "…" : "");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `${details.join("")}${message}${ending}`,
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) console.error("Telegram enquiry notification failed");
  } catch {
    console.error("Telegram enquiry notification failed");
  }
};

export const create = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const phone = normalizePhone(req.body.phone, req.body.country);
  const company = String(req.body.company || "").trim();
  const service = String(req.body.service || "").trim();
  const budget = String(req.body.budget || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Name, email and message are required" });
  }
  if (
    name.length > 100 ||
    email.length > 254 ||
    phone.length > 30 ||
    company.length > 120 ||
    service.length > 100 ||
    budget.length > 80 ||
    message.length > 5000
  ) {
    return res
      .status(422)
      .json({ message: "One or more fields exceed the allowed length" });
  }
  if (!emailPattern.test(email)) {
    return res
      .status(422)
      .json({ message: "Please enter a valid email address" });
  }
  if (!phone)
    return res
      .status(422)
      .json({
        message: "Please enter a valid phone number for the selected country.",
      });
  const enquiry = await Enquiry.create({
    name,
    email,
    phone,
    company,
    service,
    budget,
    message,
  });
  res.status(201).json({ data: enquiry });
  void sendTelegramNotification(enquiry).catch(() => {
    console.error("Telegram enquiry notification failed");
  });
};

export const list = async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ data: await Enquiry.find().sort({ createdAt: -1 }) });
};

export const update = async (req, res) => {
  const x = await Enquiry.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.status !== undefined ? { status: req.body.status } : {}),
      ...(req.body.internalNote !== undefined
        ? { internalNote: String(req.body.internalNote).slice(0, 5000) }
        : {}),
    },
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
