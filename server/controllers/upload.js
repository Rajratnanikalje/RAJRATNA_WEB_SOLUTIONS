import { v2 as cloudinary } from "cloudinary";

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

const CONFIG_ERROR =
  "Image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, then restart the API.";

/**
 * Uploads one image to Cloudinary and returns its secure URL.
 * The URL is stored on the Project / Service / Technology / Settings document
 * by the normal CMS save request, so no separate media library is used.
 */
export async function uploadImage(req, res) {
  if (!configured) {
    return res.status(503).json({ message: CONFIG_ERROR });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No image file was received." });
  }

  let uploaded;
  try {
    uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rajratna-web-solutions/uploads",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(req.file.buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error?.message || error);
    return res
      .status(502)
      .json({
        message: "Image upload failed at the image service. Please try again.",
      });
  }

  res.status(201).json({
    data: {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
    },
  });
}
