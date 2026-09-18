import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";
import { Card } from "../../components/UI";

const keys = [
  "siteTitle",
  "logoUrl",
  "heroImageUrl",
  "phone",
  "email",
  "location",
  "seoTitle",
  "seoDescription",
  "faviconUrl",
];

export default function Settings() {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.settings
      .get()
      .then((r) => setForm(r.data.data || {}))
      .catch((e) => setError(e.response?.data?.message || "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await admin.settings.save(form);
      setSuccess("Settings saved successfully.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="p-7 max-w-3xl">
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="label mb-2">CMS</div>
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Website identity, contact and SEO settings.
        </p>
      </div>

      <Card className="p-7 mt-6 max-w-3xl">
        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 flex gap-2 text-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-green-100 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={save} className="grid gap-4">
          {keys.map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-400 mb-1 block capitalize">
                {k.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {k === "seoDescription" ? (
                <textarea
                  className="input"
                  rows={3}
                  placeholder={k}
                  value={form[k] || ""}
                  onChange={(e) => handleChange(k, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  placeholder={k}
                  value={form[k] || ""}
                  onChange={(e) => handleChange(k, e.target.value)}
                />
              )}
            </div>
          ))}

          <button type="submit" className="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
            <Save size={15} />
          </button>
        </form>
      </Card>
    </>
  );
}
