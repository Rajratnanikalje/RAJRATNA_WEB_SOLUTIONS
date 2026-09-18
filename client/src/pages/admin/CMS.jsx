import { useEffect, useState } from "react";
import { Edit, Trash2, Save, X, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { admin } from "../../services/api";
import { Card } from "../../components/UI";

const cfg = {
  services: {
    title: "Services",
    singular: "Service",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Service title" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Brief description of this service" },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
    ],
  },
  projects: {
    title: "Projects",
    singular: "Project",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "Project name" },
      { key: "title", label: "Title", type: "text", placeholder: "Project headline" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Project description" },
      { key: "url", label: "URL", type: "text", placeholder: "https://..." },
      { key: "technologies", label: "Tech Stack (comma separated)", type: "text", placeholder: "React, Node.js, MongoDB" },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
    ],
  },
  technologies: {
    title: "Technologies",
    singular: "Technology",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "Technology name" },
      { key: "category", label: "Category", type: "text", placeholder: "Frontend / Backend / Database" },
      { key: "iconUrl", label: "Icon URL", type: "text", placeholder: "https://..." },
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

  const load = () => {
    setLoading(true);
    A.list()
      .then((r) => setItems(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || "Load failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
        acc[f.key] = "";
        return acc;
      }, {})
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
      await A.save(editId, d);
      setSuccess(editId ? "Updated successfully." : "Created successfully.");
      setForm({});
      setEditId(null);
      load();
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
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const renderField = (f) => {
    const value = form[f.key] ?? "";
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
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">
                      {type === "projects" ? "Name" : type === "services" ? "Title" : "Name"}
                    </th>
                    <th className="text-left">Details</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-white/5 hover:bg-white/[.02] transition-all"
                    >
                      <td className="py-3">
                        <b className="text-slate-200">
                          {item.title || item.name}
                        </b>
                      </td>
                      <td className="muted text-xs break-words max-w-xs py-3">
                        {item.description ||
                          item.category ||
                          item.url ||
                          (item.technologies?.length
                            ? item.technologies.join(", ")
                            : "")}
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
