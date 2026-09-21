import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { admin } from "../services/api";

export const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Direct image picker + upload control.
 * Picks a file from the device, uploads it through the existing API/Cloudinary
 * integration and hands the returned secure URL to the parent form.
 */
export default function ImageUploader({
  value = "",
  onChange,
  previewHeight = "h-40",
  hint = "",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear the local preview when the parent resets/clears the stored value.
  useEffect(() => {
    if (value || busy) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
    setPreview("");
    setFileName("");
    setSuccess("");
  }, [value, busy]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const dropPreview = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
    setPreview("");
    setFileName("");
  };

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      dropPreview();
      setError("Unsupported file. Please choose a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      dropPreview();
      setError("Image is too large. Maximum size is 8 MB.");
      return;
    }

    dropPreview();
    objectUrlRef.current = URL.createObjectURL(file);
    setPreview(objectUrlRef.current);
    setFileName(file.name);
    setBusy(true);

    try {
      const r = await admin.uploads.image(file);
      const url = r.data?.data?.url;
      if (!url) throw new Error("no-url");
      onChange(url);
      // Keep the local file preview until the parent form value is set.
      setPreview(objectUrlRef.current);
      setSuccess("Uploaded to Cloudinary. Save to apply this image.");
    } catch (err) {
      dropPreview();
      setError(
        err.response?.data?.message ||
          "Upload failed. Check the API server and Cloudinary configuration, then try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    if (busy) return;
    dropPreview();
    onChange("");
    setError("");
    setSuccess("");
  };

  const shown = preview || value || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3 sm:p-4">
      <div
        className={`relative w-full ${previewHeight} rounded-xl overflow-hidden border border-white/10 bg-[#0a1429] flex items-center justify-center`}
      >
        {shown ? (
          <img
            src={shown}
            alt="Selected image preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="muted text-xs px-4 text-center">
            No image selected
          </span>
        )}

        {busy && (
          <div className="absolute inset-0 bg-[#040711]/75 flex flex-col items-center justify-center gap-2 text-[#78a9ff] px-3 text-center">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-[11px] break-all line-clamp-2">
              Uploading {fileName || "image"}…
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={pick}
        disabled={disabled || busy}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="secondary text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
        >
          <ImagePlus size={14} />
          {shown ? "Replace image" : "Choose image"}
        </button>

        {shown && !busy && (
          <button
            type="button"
            className="secondary text-xs"
            onClick={clear}
            disabled={disabled}
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>

      {hint && <p className="muted text-[11px] mt-2 break-words">{hint}</p>}

      {error && (
        <div className="mt-2 flex gap-2 text-xs text-red-300">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="break-words min-w-0">{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-2 flex gap-2 text-xs text-emerald-300">
          <CheckCircle size={14} className="shrink-0 mt-0.5" />
          <span className="break-words min-w-0">{success}</span>
        </div>
      )}
    </div>
  );
}
