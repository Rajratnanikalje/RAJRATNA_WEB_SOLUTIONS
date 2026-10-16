import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import {
  login,
  requestAccountUpdateOtp,
  requestPasswordReset,
  resetPassword,
  updateAccount,
  verifyAccountUpdateOtp,
  verifyPasswordResetOtp,
} from "../controllers/auth.js";
import * as C from "../controllers/crud.js";
import * as E from "../controllers/enquiry.js";
import * as D from "../controllers/dashboard.js";
import {
  pub as publicSettings,
  get as getSettings,
  save as saveSettings,
} from "../controllers/settings.js";
import { uploadImage, validateImageContent } from "../controllers/upload.js";
const r = Router(),
  u = ["services", "projects", "technologies"];
r.post(
  "/auth/admin/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  login,
);
r.post(
  "/auth/admin/forgot-password",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  requestPasswordReset,
);
r.post(
  "/auth/admin/verify-otp",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  verifyPasswordResetOtp,
);
r.post(
  "/auth/admin/reset-password",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  resetPassword,
);
r.post(
  "/auth/admin/account/otp",
  protect,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  requestAccountUpdateOtp,
);
r.post(
  "/auth/admin/account/verify-otp",
  protect,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  verifyAccountUpdateOtp,
);
r.put(
  "/auth/admin/account",
  protect,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  updateAccount,
);
u.forEach((t) => {
  r.get(`/${t}/public`, (q, s) => {
    q.params.type = t;
    return C.pub(q, s);
  });
  r.get(`/${t}`, protect, (q, s) => {
    q.params.type = t;
    return C.list(q, s);
  });
  r.post(`/${t}`, protect, (q, s) => {
    q.params.type = t;
    return C.save(q, s);
  });
  r.put(`/${t}/:id`, protect, (q, s) => {
    q.params.type = t;
    return C.save(q, s);
  });
  r.delete(`/${t}/:id`, protect, (q, s) => {
    q.params.type = t;
    return C.del(q, s);
  });
});
r.post("/enquiries", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), E.create);
r.get("/enquiries", protect, E.list);
r.patch("/enquiries/:id", protect, E.update);
r.delete("/enquiries/:id", protect, E.del);
r.post(
  "/dashboard/view",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 60 }),
  D.view,
);
r.get("/dashboard", protect, D.dashboard);
r.get("/settings/public", publicSettings);
r.get("/settings", protect, getSettings);
r.put("/settings", protect, saveSettings);
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0 },
  fileFilter: (q, f, cb) =>
    IMAGE_TYPES.includes(f.mimetype)
      ? cb(null, true)
      : cb(
          Object.assign(
            new Error(
              "Unsupported file. Please choose a JPG, JPEG, PNG or WEBP image.",
            ),
            { statusCode: 422 },
          ),
        ),
});
const singleImage = (q, s, n) =>
  imageUpload.single("image")(q, s, (e) => {
    if (!e) return n();
    if (e.code === "LIMIT_FILE_SIZE")
      return s
        .status(413)
        .json({ message: "Image is too large. Maximum size is 8 MB." });
    if (e.code === "LIMIT_FILE_COUNT")
      return s
        .status(400)
        .json({ message: "Only one image can be uploaded at a time." });
    if (e.code === "LIMIT_UNEXPECTED_FILE" && e.field === "image")
      return s
        .status(400)
        .json({ message: "Only one image can be uploaded at a time." });
    if (e.code === "LIMIT_UNEXPECTED_FILE")
      return s.status(400).json({
        message: "Upload one image using the 'image' field.",
      });
    if (e.code === "LIMIT_FIELD_COUNT")
      return s.status(400).json({
        message: "Unexpected form fields. Upload one image only.",
      });
    return s
      .status(e.statusCode || 422)
      .json({ message: e.message || "Unsupported image file." });
  });
r.post(
  "/uploads/image",
  protect,
  singleImage,
  validateImageContent,
  uploadImage,
);
export default r;
