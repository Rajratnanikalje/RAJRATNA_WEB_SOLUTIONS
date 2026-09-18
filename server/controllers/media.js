import { v2 as cloudinary } from "cloudinary";
import Media from "../models/Media.js";

const configured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const list = async (req, res) => {
  res.json({ data: await Media.find().sort({ createdAt: -1 }) });
};

export const upload = async (req, res) => {
  if (!configured) {
    return res.status(503).json({
      message: "Media uploads are not configured. Add Cloudinary credentials to the server environment.",
    });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  let uploaded;
  try {
    uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "rajratna-web-solutions/media", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(req.file.buffer);
    });

    const media = await Media.create({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      resourceType: uploaded.resource_type || "image",
    });
    return res.status(201).json({ data: media });
  } catch (error) {
    if (uploaded?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploaded.public_id, {
          resource_type: uploaded.resource_type || "image",
        });
      } catch {
        // Best-effort cleanup for an orphaned Cloudinary asset.
      }
    }
    throw error;
  }
};

export const del = async (req, res) => {
  const x = await Media.findById(req.params.id);
  if (!x) return res.status(404).json({ message: "Media not found" });
  await cloudinary.uploader.destroy(x.publicId, {
    resource_type: x.resourceType || "image",
  });
  await x.deleteOne();
  res.json({ message: "Deleted" });
};
