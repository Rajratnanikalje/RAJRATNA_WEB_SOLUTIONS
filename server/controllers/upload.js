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

const MAX_IMAGE_DIMENSION = 16_384;
const MAX_IMAGE_PIXELS = 40_000_000;
const JPEG_START_OF_FRAME = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
  0xcf,
]);

const jpegDimensions = (buffer) => {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8)
    return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > buffer.length) return null;

    const segmentLength = buffer.readUInt16BE(offset);
    if (
      segmentLength < 2 ||
      offset + segmentLength > buffer.length
    )
      return null;
    const dataOffset = offset + 2;
    if (JPEG_START_OF_FRAME.has(marker)) {
      if (segmentLength < 7) return null;
      return {
        width: buffer.readUInt16BE(dataOffset + 3),
        height: buffer.readUInt16BE(dataOffset + 1),
        format: "jpeg",
      };
    }
    offset += segmentLength;
  }
  return null;
};

const pngDimensions = (buffer) => {
  if (
    buffer.length < 33 ||
    !buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    buffer.readUInt32BE(8) !== 13 ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  )
    return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    format: "png",
  };
};

const webpDimensions = (buffer) => {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP" ||
    buffer.readUInt32LE(4) + 8 > buffer.length
  )
    return null;

  let offset = 12;
  let extendedDimensions = null;
  let hasFrame = false;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buffer.length) return null;

    if (chunk === "VP8X" && size >= 10) {
      extendedDimensions = {
        width: 1 + buffer.readUIntLE(data + 4, 3),
        height: 1 + buffer.readUIntLE(data + 7, 3),
        format: "webp",
      };
    }
    if (chunk === "ANMF" && size >= 16) hasFrame = true;
    if (chunk === "VP8L" && size >= 5 && buffer[data] === 0x2f) {
      const dimensions = buffer.readUInt32LE(data + 1);
      return {
        width: 1 + (dimensions & 0x3fff),
        height: 1 + ((dimensions >>> 14) & 0x3fff),
        format: "webp",
      };
    }
    if (
      chunk === "VP8 " &&
      size >= 10 &&
      buffer[data + 3] === 0x9d &&
      buffer[data + 4] === 0x01 &&
      buffer[data + 5] === 0x2a
    ) {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
        format: "webp",
      };
    }
    offset = data + size + (size % 2);
  }
  return hasFrame ? extendedDimensions : null;
};

const readImageDimensions = (buffer) =>
  pngDimensions(buffer) || jpegDimensions(buffer) || webpDimensions(buffer);

export function validateImageContent(req, res, next) {
  if (!req.file) return next();

  const image = readImageDimensions(req.file.buffer);
  const mimeFormats = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!image || mimeFormats[req.file.mimetype] !== image.format) {
    return res.status(422).json({
      message: "The file is not a valid JPEG, PNG or WebP image.",
    });
  }
  if (
    image.width < 1 ||
    image.height < 1 ||
    image.width > MAX_IMAGE_DIMENSION ||
    image.height > MAX_IMAGE_DIMENSION ||
    image.width * image.height > MAX_IMAGE_PIXELS
  ) {
    return res.status(422).json({
      message: "Image dimensions must not exceed 16,384 px per side or 40 megapixels.",
    });
  }

  return next();
}

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
