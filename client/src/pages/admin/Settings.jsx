import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";
import { notifyContentUpdated } from "../../hooks/useContentRefresh";
import ImageUploader from "../../components/ImageUploader";
import { Card } from "../../components/UI";

const keys = [
  "siteTitle",
  "logoUrl",
  "heroImageUrl",
  "homeHeroTitle",
  "homeHeroSubtitle",
  "aboutImageUrl",
  "aboutTitle",
  "aboutDescription",
  "phone",
  "email",
  "location",
  "seoTitle",
  "seoDescription",
  "faviconUrl",
];

// Image settings use the direct upload control instead of a pasted URL.
const imageFields = {
  logoUrl: {
    label: "Logo",
    previewHeight: "h-36",
    hint: "PNG or WEBP with a transparent background works best. Shown in the website navbar.",
  },
  heroImageUrl: {
    label: "Hero Image",
    previewHeight: "h-44",
    hint: "Full-width background photo for the home page hero. Landscape 1920×1080 or larger works best.",
  },
  aboutImageUrl: {
    label: "About Page Image",
    previewHeight: "h-44",
    hint: "Your photo, workspace, or brand image. Shown on the About page in place of the code illustration.",
  },
  faviconUrl: {
    label: "Favicon",
    previewHeight: "h-24",
    hint: "Square PNG, 512 x 512 recommended.",
  },
};

export default function Settings() {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState({ email: "", currentPassword: "", newPassword: "" });
  const [accountStatus, setAccountStatus] = useState({ error: "", success: "" });

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
      notifyContentUpdated();
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
  const saveAccount = async (e) => {
    e.preventDefault();
    setAccountStatus({ error: "", success: "" });
    try {
      const response = await admin.updateAccount(account);
      localStorage.removeItem("rws_token");
      setAccountStatus({ error: "", success: response.data.message });
      setTimeout(() => window.location.assign("/admin/login"), 1200);
    } catch (e) {
      setAccountStatus({ error: e.response?.data?.message || "Could not update account.", success: "" });
    }
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
                {imageFields[k]?.label || k.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {imageFields[k] ? (
                <ImageUploader
                  value={form[k] || ""}
                  onChange={(url) => handleChange(k, url)}
                  previewHeight={imageFields[k].previewHeight}
                  hint={imageFields[k].hint}
                />
              ) : ["seoDescription", "aboutDescription"].includes(k) ? (
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
      <Card className="p-7 mt-6 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-100">Admin Account</h2>
        <p className="muted text-sm mt-1">Change your login email or password. You will be signed out after saving.</p>
        <form onSubmit={saveAccount} className="grid gap-4 mt-5">
          <input className="input" type="email" placeholder="New email address (optional)" value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} />
          <input className="input" type="password" placeholder="New password (optional, minimum 8 characters)" value={account.newPassword} onChange={(e) => setAccount((a) => ({ ...a, newPassword: e.target.value }))} minLength={8} />
          <input className="input" type="password" placeholder="Current password (required)" value={account.currentPassword} onChange={(e) => setAccount((a) => ({ ...a, currentPassword: e.target.value }))} required />
          {accountStatus.error && <p className="text-red-300 text-sm">{accountStatus.error}</p>}
          {accountStatus.success && <p className="text-emerald-300 text-sm">{accountStatus.success}</p>}
          <button type="submit" className="primary">Update Admin Account</button>
        </form>
      </Card>
    </>
  );
}
