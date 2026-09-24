import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";
import { notifyContentUpdated } from "../../hooks/useContentRefresh";
import ImageUploader from "../../components/ImageUploader";
import { Card } from "../../components/UI";
import { PUBLIC_ROUTE_OPTIONS } from "../../content/siteRoutes";

const keysBySection = {
  website: ["siteTitle", "faviconUrl"],
  contact: ["email", "phone", "whatsapp", "location", "socialLinks"],
  seo: ["seoTitle", "seoDescription", "ogTitle", "ogDescription", "ogImage"],
};

const seoPageDefaults = PUBLIC_ROUTE_OPTIONS.map(({ value }) => ({ pageKey: value, indexable: true }));

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
  ogImage: {
    label: "Open Graph Image",
    previewHeight: "h-44",
    hint: "Image used when a page is shared on social platforms.",
  },
};

export default function Settings({ section = "website" }) {
  const keys = keysBySection[section] || keysBySection.website;
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState({ email: "", newPassword: "", otp: "", resetToken: "" });
  const [accountOtpSent, setAccountOtpSent] = useState(false);
  const [accountOtpBusy, setAccountOtpBusy] = useState(false);
  const [accountStatus, setAccountStatus] = useState({ error: "", success: "" });

  useEffect(() => {
    admin.settings
      .get()
      .then((r) => {
        const data = r.data.data || {};
        const pageSeo = seoPageDefaults.map((defaults) => ({ ...defaults, ...(data.pageSeo || []).find((item) => item.pageKey === defaults.pageKey) }));
        setForm({ ...data, socialLinks: (data.socialLinks || []).join("\n"), footerSocialLinks: (data.footerSocialLinks || []).join("\n"), pageSeo });
      })
      .catch((e) => setError(e.response?.data?.message || "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = Object.fromEntries(keys.map((key) => [key, form[key]]));
      if (typeof payload.socialLinks === "string") payload.socialLinks = payload.socialLinks.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
      await admin.settings.save(payload);
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
  const updateSeoPage = (index, key, value) => setForm((current) => ({ ...current, pageSeo: (current.pageSeo || seoPageDefaults).map((page, i) => i === index ? { ...page, [key]: value } : page) }));
  const saveAccount = async (e) => {
    e.preventDefault();
    setAccountStatus({ error: "", success: "" });
    if (!account.resetToken) {
      setAccountStatus({ error: "Verify the OTP sent to your registered email before updating the account.", success: "" });
      return;
    }
    try {
      const response = await admin.updateAccount({ email: account.email, newPassword: account.newPassword, resetToken: account.resetToken });
      localStorage.removeItem("rws_token");
      setAccountStatus({ error: "", success: response.data.message });
      setTimeout(() => window.location.assign("/admin/login"), 1200);
    } catch (e) {
      setAccountStatus({ error: e.response?.data?.message || "Could not update account.", success: "" });
    }
  };
  const requestAccountOtp = async () => {
    setAccountOtpBusy(true);
    setAccountStatus({ error: "", success: "" });
    try {
      const response = await admin.requestAccountOtp();
      setAccountOtpSent(true);
      setAccountStatus({ error: "", success: response.data.message });
    } catch (e) {
      setAccountStatus({ error: e.response?.data?.message || "Could not send OTP.", success: "" });
    } finally {
      setAccountOtpBusy(false);
    }
  };
  const verifyAccountOtp = async () => {
    if (!/^\d{6}$/.test(account.otp)) {
      setAccountStatus({ error: "Enter the 6-digit OTP from your email.", success: "" });
      return;
    }
    setAccountOtpBusy(true);
    setAccountStatus({ error: "", success: "" });
    try {
      const response = await admin.verifyAccountOtp({ otp: account.otp });
      setAccount((current) => ({ ...current, resetToken: response.data.resetToken }));
      setAccountStatus({ error: "", success: "OTP verified. You can now update your account." });
    } catch (e) {
      setAccountStatus({ error: e.response?.data?.message || "Could not verify OTP.", success: "" });
    } finally {
      setAccountOtpBusy(false);
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
        <h1 className="text-3xl font-bold text-slate-100">{{ website: "Website Settings", contact: "Contact & Social", seo: "SEO" }[section] || "Settings"}</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {section === "website" ? "Manage the website name and favicon. Navbar branding and logo are managed in Navbar." : section === "contact" ? "Manage contact details and social links used by the Contact page." : "Manage titles, descriptions, canonical URLs, social previews, and indexing per public page."}
        </p>
      </div>

      {section === "website" && <Card className="p-7 mt-6 max-w-3xl">
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
              ) : ["seoDescription", "ogDescription", "socialLinks"].includes(k) ? (
                <textarea
                  className="input"
                  rows={k === "socialLinks" ? 5 : 3}
                  placeholder={k === "socialLinks" ? "One https:// social profile URL per line" : k}
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
      </Card>}

      {section === "seo" && <Card className="p-7 mt-6 max-w-4xl">
        {error && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200" role="alert">{error}</p>}
        {success && <p className="mb-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-200" role="status">{success}</p>}
        <div className="mb-5"><h2 className="text-xl font-semibold">Per-page SEO</h2><p className="text-sm text-slate-500 mt-1">Edit metadata for each existing public route. Admin routes remain noindex.</p></div>
        <div className="grid gap-4">{(form.pageSeo || seoPageDefaults).map((page, index) => <details key={page.pageKey} className="rounded-xl border border-white/10 bg-white/[.02] p-4" open={index === 0}>
          <summary className="cursor-pointer font-semibold text-slate-200">{PUBLIC_ROUTE_OPTIONS.find((route) => route.value === page.pageKey)?.label || page.pageKey}</summary>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {[ ["title", "Page title", "text"], ["description", "Meta description", "textarea"], ["canonicalUrl", "Canonical URL (optional)", "url"], ["ogTitle", "Open Graph title", "text"], ["ogDescription", "Open Graph description", "textarea"], ["twitterTitle", "Twitter title", "text"], ["twitterDescription", "Twitter description", "textarea"] ].map(([key, label, kind]) => <label key={key} className="grid gap-1 text-xs text-slate-400">{label}{kind === "textarea" ? <textarea className="input" rows={3} value={page[key] || ""} onChange={(e) => updateSeoPage(index, key, e.target.value)}/> : <input type={kind} className="input" value={page[key] || ""} onChange={(e) => updateSeoPage(index, key, e.target.value)}/>}</label>)}
            <label className="grid gap-1 text-xs text-slate-400">Twitter card type<select className="input" value={page.twitterCard || "summary"} onChange={(e) => updateSeoPage(index, "twitterCard", e.target.value)}><option value="summary">Summary</option><option value="summary_large_image">Summary with large image</option></select></label>
            {[ ["ogImage", "Open Graph image"], ["twitterImage", "Twitter image"] ].map(([key, label]) => <label key={key} className="grid gap-1 text-xs text-slate-400">{label}<ImageUploader value={page[key] || ""} onChange={(url) => updateSeoPage(index, key, url)} previewHeight="h-28" hint="Use the existing Cloudinary uploader."/></label>)}
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={page.indexable !== false} onChange={(e) => updateSeoPage(index, "indexable", e.target.checked)}/> Allow search indexing</label>
          </div>
        </details>)}</div>
        <button type="button" className="primary mt-5" onClick={async () => { setSaving(true); setError(""); setSuccess(""); try { await admin.settings.save({ pageSeo: form.pageSeo || seoPageDefaults }); notifyContentUpdated(); setSuccess("Per-page SEO saved successfully."); } catch (e) { setError(e.response?.data?.message || "Could not save page SEO."); } finally { setSaving(false); } }} disabled={saving}>{saving ? "Saving..." : "Save Per-page SEO"}<Save size={15}/></button>
      </Card>}
      <Card className="p-7 mt-6 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-100">Admin Account</h2>
        <p className="muted text-sm mt-1">Verify an OTP sent to your registered email before changing your login email or password.</p>
        <form onSubmit={saveAccount} className="grid gap-4 mt-5">
          <input className="input" type="email" placeholder="New email address (optional)" value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} />
          <input className="input" type="password" placeholder="New password (optional, minimum 8 characters)" value={account.newPassword} onChange={(e) => setAccount((a) => ({ ...a, newPassword: e.target.value }))} minLength={8} />
          {!accountOtpSent ? (
            <button type="button" className="secondary" onClick={requestAccountOtp} disabled={accountOtpBusy}> {accountOtpBusy ? "Sending OTP..." : "Send verification OTP"} </button>
          ) : !account.resetToken ? (
            <div className="grid gap-3">
              <input className="input tracking-[.35em] text-center" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit OTP" value={account.otp} onChange={(e) => setAccount((a) => ({ ...a, otp: e.target.value.replace(/\D/g, "") }))} />
              <div className="flex gap-3"><button type="button" className="secondary flex-1" onClick={requestAccountOtp} disabled={accountOtpBusy}>Resend OTP</button><button type="button" className="primary flex-1" onClick={verifyAccountOtp} disabled={accountOtpBusy}>{accountOtpBusy ? "Verifying..." : "Verify OTP"}</button></div>
            </div>
          ) : null}
          {accountStatus.error && <p className="text-red-300 text-sm">{accountStatus.error}</p>}
          {accountStatus.success && <p className="text-emerald-300 text-sm">{accountStatus.success}</p>}
          {account.resetToken && <button type="submit" className="primary">Update Admin Account</button>}
        </form>
      </Card>
    </>
  );
}
