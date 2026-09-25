import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { admin } from "../../services/api";
import { notifyContentUpdated } from "../../hooks/useContentRefresh";
import ImageUploader from "../../components/ImageUploader";
import { Card } from "../../components/UI";
import { PUBLIC_ROUTE_OPTIONS } from "../../content/siteRoutes";

const cfg = {
  services: {
    title: "Services",
    singular: "Service",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        placeholder: "Service title",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Brief description of this service",
      },
      {
        key: "imageUrl",
        label: "Service Image",
        type: "image",
        imageHint: "JPG, JPEG, PNG or WEBP up to 8 MB.",
      },
      {
        key: "displayOrder",
        label: "Display Order",
        type: "number",
        placeholder: "0",
      },
    ],
  },
  projects: {
    title: "Projects",
    singular: "Project",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "Project name" },
      {
        key: "category",
        label: "Category",
        type: "text",
        placeholder: "Web App / E-commerce / Portfolio",
      },
      {
        key: "title",
        label: "Headline (optional)",
        type: "text",
        placeholder: "Project headline",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Project description",
      },
      {
        key: "fullDescription",
        label: "Full Description",
        type: "textarea",
        placeholder: "Optional additional project details",
      },
      {
        key: "url",
        label: "Live Demo URL (optional)",
        type: "url",
        placeholder: "https://...",
      },
      {
        key: "githubUrl",
        label: "GitHub URL (optional)",
        type: "url",
        placeholder: "https://github.com/...",
      },
      {
        key: "technologies",
        label: "Tech Stack (comma separated)",
        type: "text",
        placeholder: "React, Node.js, MongoDB",
      },
      {
        key: "imageUrl",
        label: "Project Image",
        type: "image",
        imageHint:
          "JPG, JPEG, PNG or WEBP up to 8 MB. Shown on the public Portfolio and home page.",
      },
      {
        key: "displayOrder",
        label: "Display Order",
        type: "number",
        placeholder: "0",
      },
    ],
  },
  technologies: {
    title: "Technologies",
    singular: "Technology",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        placeholder: "Technology name",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
        placeholder: "Frontend / Backend / Database",
      },
      {
        key: "iconUrl",
        label: "Technology Icon",
        type: "image",
        imageHint:
          "Square transparent PNG works best. JPG, JPEG, PNG or WEBP up to 8 MB.",
      },
      {
        key: "displayOrder",
        label: "Display Order",
        type: "number",
        placeholder: "0",
      },
    ],
  },
};

export default function CMS({ type }) {
  const c = cfg[type];
  const A = admin[type];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState({});
  const [pageSaving, setPageSaving] = useState(false);
  const pageFields =
    {
      services: [
        { key: "servicesPageVisible", label: "Page visible", type: "checkbox" },
        { key: "servicesPageEyebrow", label: "Page eyebrow", type: "text" },
        { key: "servicesPageTitle", label: "Page heading", type: "text" },
        {
          key: "servicesPageDescription",
          label: "Page description",
          type: "textarea",
        },
        { key: "serviceCardCtaText", label: "Service card CTA", type: "text" },
        {
          key: "serviceCardCtaRouteKey",
          label: "Service card CTA destination",
          type: "select",
        },
        { key: "servicesCtaText", label: "Bottom CTA", type: "text" },
        {
          key: "servicesCtaRouteKey",
          label: "Bottom CTA destination",
          type: "select",
        },
      ],
      projects: [
        {
          key: "portfolioPageVisible",
          label: "Page visible",
          type: "checkbox",
        },
        { key: "portfolioPageEyebrow", label: "Page eyebrow", type: "text" },
        { key: "portfolioPageTitle", label: "Page heading", type: "text" },
        {
          key: "portfolioPageDescription",
          label: "Page description",
          type: "textarea",
        },
        { key: "projectDemoLabel", label: "Demo link label", type: "text" },
        { key: "projectGithubLabel", label: "GitHub link label", type: "text" },
        {
          key: "projectDetailsLabel",
          label: "Details toggle label",
          type: "text",
        },
      ],
      technologies: [
        {
          key: "technologiesPageVisible",
          label: "Page visible",
          type: "checkbox",
        },
        { key: "technologiesPageEyebrow", label: "Page eyebrow", type: "text" },
        { key: "technologiesPageTitle", label: "Page heading", type: "text" },
        {
          key: "technologiesPageDescription",
          label: "Page description",
          type: "textarea",
        },
      ],
    }[type] || [];

  const load = () => {
    setLoading(true);
    A.list()
      .then((r) => setItems(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || "Load failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // The admin routes reuse this component for Services / Projects /
    // Technologies, so reset and re-fetch whenever the section (type)
    // changes — otherwise the previous section's list and form stayed
    // visible until a full page refresh.
    setItems([]);
    setForm({});
    setEditId(null);
    setError("");
    setSuccess("");
    load();
    admin.settings
      .get()
      .then((r) => setPageSettings(r.data.data || {}))
      .catch(() => {});
  }, [type]);

  const savePageSettings = async (event) => {
    event.preventDefault();
    setPageSaving(true);
    try {
      await admin.settings.save(
        Object.fromEntries(
          pageFields.map(({ key }) => [
            key,
            pageSettings[key] ?? (key.endsWith("Visible") ? true : ""),
          ]),
        ),
      );
      setSuccess("Page content saved and published.");
      notifyContentUpdated();
    } catch (e) {
      setError(e.response?.data?.message || "Page content could not be saved.");
    } finally {
      setPageSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    const techs = Array.isArray(item.technologies)
      ? item.technologies.join(", ")
      : item.technologies || "";
    setForm({ ...item, technologies: techs });
    setError("");
    setSuccess("");
  };

  const startNew = () => {
    setEditId(null);
    setForm(
      c.fields.reduce((acc, f) => {
        acc[f.key] = f.type === "number" ? 0 : "";
        return acc;
      }, {}),
    );
    setError("");
    setSuccess("");
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const d = { ...form };
      if (type === "projects" && typeof d.technologies === "string") {
        d.technologies = d.technologies
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      d.published = d.published !== false;
      if (type === "projects") d.featured = d.featured === true;
      if (d.displayOrder !== undefined)
        d.displayOrder = Number(d.displayOrder) || 0;
      await A.save(editId, d);
      setSuccess(editId ? "Updated successfully." : "Created successfully.");
      setForm({});
      setEditId(null);
      load();
      // Tell any open public page (same tab or another tab) to re-fetch,
      // so new content appears without a manual browser refresh.
      notifyContentUpdated();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await A.del(id);
      load();
      // Public pages (e.g. Portfolio) must drop the deleted item immediately.
      notifyContentUpdated();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const renderField = (f) => {
    const value = form[f.key] ?? "";
    if (f.type === "image") {
      return (
        <ImageUploader
          key={f.key}
          value={value}
          onChange={(url) => handleChange(f.key, url)}
          previewHeight={f.key === "iconUrl" ? "h-28" : "h-44"}
          hint={f.imageHint}
        />
      );
    }
    if (f.type === "textarea") {
      return (
        <textarea
          key={f.key}
          rows={4}
          className="input"
          placeholder={f.placeholder}
          value={value}
          onChange={(e) => handleChange(f.key, e.target.value)}
          maxLength={f.key === "description" ? 5000 : undefined}
        />
      );
    }
    if (f.type === "checkbox")
      return (
        <input
          key={f.key}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => handleChange(f.key, e.target.checked)}
          className="h-4 w-4 accent-blue-400"
        />
      );
    return (
      <input
        key={f.key}
        type={f.type}
        className="input"
        placeholder={f.placeholder}
        value={value}
        onChange={(e) => handleChange(f.key, e.target.value)}
      />
    );
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4 items-end mb-8">
        <div>
          <div className="label mb-2">CMS</div>
          <h1 className="text-3xl font-bold text-slate-100">{c.title}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage {c.title.toLowerCase()} stored in MongoDB.
          </p>
        </div>
        <button
          className="primary flex items-center gap-2"
          onClick={() => startNew()}
        >
          <Plus size={15} />
          Add {c.singular}
        </button>
      </div>

      {!!pageFields.length && (
        <Card className="p-6 mb-6">
          <form
            onSubmit={savePageSettings}
            className="grid md:grid-cols-2 gap-4"
          >
            <h2 className="md:col-span-2 text-xl font-semibold">
              Public page content
            </h2>
            {pageFields.map((field) => (
              <label
                key={field.key}
                className="grid gap-1 text-xs text-slate-400"
              >
                {field.label}
                {field.type === "checkbox" ? (
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={pageSettings[field.key] !== false}
                      onChange={(e) =>
                        setPageSettings((current) => ({
                          ...current,
                          [field.key]: e.target.checked,
                        }))
                      }
                    />{" "}
                    Visible on public site
                  </span>
                ) : field.type === "select" ? (
                  <select
                    className="input"
                    value={pageSettings[field.key] || "contact"}
                    onChange={(e) =>
                      setPageSettings((current) => ({
                        ...current,
                        [field.key]: e.target.value,
                      }))
                    }
                  >
                    {PUBLIC_ROUTE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={pageSettings[field.key] || ""}
                    onChange={(e) =>
                      setPageSettings((current) => ({
                        ...current,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <input
                    className="input"
                    value={pageSettings[field.key] || ""}
                    onChange={(e) =>
                      setPageSettings((current) => ({
                        ...current,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
            <button
              className="primary md:col-span-2 justify-center"
              disabled={pageSaving}
            >
              {pageSaving ? "Saving..." : "Save Page Content"}
              <Save size={15} />
            </button>
          </form>
        </Card>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 flex gap-2 text-red-100">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 flex gap-2 text-green-100">
          <CheckCircle size={16} className="shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="grid xl:grid-cols-2 gap-5">
        {/* Form */}
        <Card className="p-7">
          <form onSubmit={save} className="grid gap-4">
            {c.fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  {f.label}
                </label>
                {renderField(f)}
              </div>
            ))}
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published !== false}
                onChange={(e) => handleChange("published", e.target.checked)}
              />
              Published on public website
            </label>
            {type === "projects" && (
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                />{" "}
                Featured project
              </label>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="primary flex-1 justify-center"
                disabled={saving}
              >
                {saving ? "Saving..." : editId ? "Update" : "Create"}
                <Save size={15} />
              </button>
              {editId && (
                <button
                  type="button"
                  className="secondary flex-1 justify-center"
                  onClick={startNew}
                >
                  Cancel
                  <X size={15} />
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* List */}
        <Card className="p-7">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-xl bg-white/[.03] border border-white/10 animate-pulse"
                >
                  <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <p className="muted">No records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr>
                    <th className="text-left whitespace-nowrap w-[38%]">
                      {type === "projects"
                        ? "Name"
                        : type === "services"
                          ? "Title"
                          : "Name"}
                    </th>
                    <th className="text-left whitespace-nowrap w-[42%]">
                      Details
                    </th>
                    <th className="text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-white/5 hover:bg-white/[.02] transition-all"
                    >
                      <td className="py-3">
                        <b
                          className="text-slate-200 block truncate"
                          title={item.title || item.name}
                        >
                          {item.title || item.name}
                        </b>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span
                            className={`text-[10px] rounded-full px-2 py-0.5 border ${item.published ? "border-emerald-400/20 text-emerald-300" : "border-amber-400/20 text-amber-300"}`}
                          >
                            {item.published ? "Published" : "Draft"}
                          </span>
                          {item.featured && (
                            <span className="text-[10px] rounded-full px-2 py-0.5 border border-[#78a9ff]/20 text-[#78a9ff]">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="muted text-xs py-3">
                        <div
                          className="line-clamp-2"
                          title={
                            item.description ||
                            item.category ||
                            item.url ||
                            (item.technologies?.length
                              ? item.technologies.join(", ")
                              : "")
                          }
                        >
                          {item.description ||
                            item.category ||
                            item.url ||
                            (item.technologies?.length
                              ? item.technologies.join(", ")
                              : "")}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg border border-[#78a9ff]/20 text-[#78a9ff] hover:bg-[#78a9ff]/10 transition-all"
                            aria-label="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() =>
                              remove(item._id, item.title || item.name)
                            }
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
