import { useEffect, useState } from "react";
import { ImagePlus, Trash2, Upload, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";
import { Card } from "../../components/UI";

export default function Media() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    admin.media
      .list()
      .then((r) => setItems(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load media."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.append("image", file);
      await admin.media.upload(data);
      setFile(null);
      e.currentTarget.reset();
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      await admin.media.del(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete image.");
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="label mb-2">CMS</div>
        <h1 className="text-3xl font-bold text-slate-100">Media</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Upload and manage website images via Cloudinary.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 flex gap-3 text-red-100">
          <AlertCircle size={18} className="shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <Card className="p-6 mt-8">
        <form onSubmit={upload} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="secondary cursor-pointer text-sm w-full sm:w-auto flex items-center">
            <ImagePlus size={17} className="mr-2" />
            Choose image
            <input
              type="file"
              accept="image/*"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <span className="muted text-sm truncate grow">
            {file ? file.name : "No file selected"}
          </span>
          <button
            type="submit"
            className="primary text-sm w-full sm:w-auto flex items-center gap-1"
            disabled={!file || busy}
          >
            {busy ? "Uploading…" : "Upload"}
            <Upload size={16} />
          </button>
        </form>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-white/5" />
            </Card>
          ))
        ) : items.length === 0 ? (
          <Card className="p-7 muted text-center col-span-full">
            No media uploaded yet.
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <img
                src={item.url}
                alt={item.alt || "Website media"}
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(item._id)}
                className="w-full flex items-center justify-center gap-2 p-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
