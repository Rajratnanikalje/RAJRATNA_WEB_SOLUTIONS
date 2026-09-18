import { useEffect, useState, useRef } from "react";
import {
  Mail,
  Phone,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { admin } from "../../services/api";
import { Card } from "../../components/UI";

const statusIcons = {
  New: AlertCircle,
  "In Progress": Clock,
  Resolved: CheckCircle,
};

const statusColors = {
  New: "bg-[#78a9ff]/15 text-[#78a9ff] border-[#78a9ff]/30",
  "In Progress": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Resolved: "bg-green-500/15 text-green-300 border-green-500/30",
};

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [flashId, setFlashId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const highlightRefs = useRef({});

  const load = () => {
    setLoading(true);
    admin
      .enquiries
      .list()
      .then((r) => setItems(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load enquiries."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const id = sessionStorage.getItem("flashEnquiryId");
    if (id) {
      setFlashId(id);
      sessionStorage.removeItem("flashEnquiryId");
      setTimeout(() => {
        const el = highlightRefs.current[id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add(
            "ring-2",
            "ring-[#78a9ff]",
            "ring-offset-2",
            "ring-offset-slate-900"
          );
        }
      }, 300);
    }
  }, []);

  useEffect(() => {
    const handleNew = () => load();
    window.addEventListener("rws:new-enquiry", handleNew);
    return () => window.removeEventListener("rws:new-enquiry", handleNew);
  }, []);

  const update = async (id, status) => {
    try {
      await admin.enquiries.update(id, { status });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not update enquiry.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this enquiry?")) return;
    try {
      await admin.enquiries.del(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete enquiry.");
    }
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatPhone = (p) => (p ? p.replace(/[\s\-()]/g, "") : "");

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4 items-end mb-8">
        <div>
          <div className="label mb-2">CMS</div>
          <h1 className="text-3xl font-bold text-slate-100">Messages / Enquiries</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review and update customer enquiries.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full sm:w-72"
          />
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full border ${
            statusColors[
              items.find((i) => i.status === "New")?.status || "New"
            ]
          }`}
        >
          {items.filter((i) => i.status === "New").length} new
        </span>
      </div>

      <div className="grid gap-4 mt-6">
        {loading ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="p-6 animate-pulse">
              <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-3 w-full bg-white/5 rounded mb-1" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </Card>
          ))
        ) : !filtered.length ? (
          <Card className="p-7 muted text-center">
            No enquiries yet.
          </Card>
        ) : (
          filtered.map((item) => {
            const Icon = statusIcons[item.status] || AlertCircle;
            const phone = formatPhone(item.phone);
            const actions = [];

            if (item.phone) {
              actions.push({
                label: "Call",
                icon: Phone,
                href: `tel:${phone}`,
              });
            }
            actions.push({
              label: "Email",
              icon: Mail,
              href: `mailto:${item.email}?subject=Regarding your enquiry`,
            });
            if (item.phone) {
              const waText = encodeURIComponent(
                `Hello ${item.name}, this is Rajratna Web Solutions regarding your enquiry.`
              );
              actions.push({
                label: "WhatsApp",
                icon: Send,
                href: `https://wa.me/${phone}?text=${waText}`,
              });
            }

            return (
              <Card
                key={item._id}
                ref={(el) => {
                  if (item._id === flashId) {
                    highlightRefs.current[item._id] = el;
                  }
                }}
                className={`p-6 transition-all duration-500 ${
                  item._id === flashId
                    ? "enquiry-highlight border-2 border-[#78a9ff]"
                    : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={14}
                        className={`shrink-0 ${
                          item.status === "New"
                            ? "text-[#78a9ff]"
                            : item.status === "In Progress"
                            ? "text-amber-300"
                            : "text-green-300"
                        }`}
                      />
                      <b
                        className={`${
                          item.status === "New"
                            ? "text-white"
                            : "text-slate-300"
                        } font-medium`}
                      >
                        {item.name}
                      </b>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          statusColors[item.status] || statusColors["New"]
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="muted text-sm break-words mt-1">
                      {item.email}
                      {item.phone && ` · ${item.phone}`}
                    </div>

                    <p className="mt-4 leading-6 break-words whitespace-pre-wrap">
                      {item.message}
                    </p>

                    <div className="enquiry-actions flex flex-wrap items-center gap-2 mt-4">
                      {actions.map((a) => {
                        const Ai = a.icon;
                        return (
                          <a
                            key={a.label}
                            href={a.href}
                            target="_blank"
                            rel="noreferrer"
                            className={`action-btn action-${
                              a.label.toLowerCase()
                            }`}
                          >
                            <Ai size={14} />
                            {a.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <div className="enquiry-actions flex flex-wrap items-center gap-2 shrink-0">
                    <label className="text-xs font-medium text-slate-400">
                      Status
                    </label>
                    <select
                      aria-label={`Status for ${item.name}`}
                      className="input !w-auto min-w-32"
                      value={item.status}
                      onChange={(e) => update(item._id, e.target.value)}
                    >
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => remove(item._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
