import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Eye,
  FolderKanban,
  Inbox,
  TriangleAlert,
  AlertCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  Mail,
  Phone,
  Send,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { admin } from "../../services/api";
import { Card } from "../../components/UI";
import { Link } from "react-router-dom";

const statCards = [
  { key: "projects", label: "Total Projects", icon: Briefcase, color: "from-purple-500/20 to-blue-500/10" },
  { key: "services", label: "Total Services", icon: BarChart3, color: "from-cyan-500/20 to-blue-500/10" },
  { key: "enquiries", label: "Total Enquiries", icon: Inbox, color: "from-amber-500/20 to-orange-500/10" },
  { key: "views", label: "Total Views", icon: Eye, color: "from-green-500/20 to-emerald-500/10" },
];

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

function CountUp({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number" || value < 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, (duration * 1000) / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-[#78a9ff] font-extrabold text-2xl sm:text-4xl"
    >
      {display}
    </motion.span>
  );
}

function StatCard({ stat, index, loading }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="stat-card glass-premium rounded-3xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-4 sm:gap-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center border border-[#78a9ff]/20`}
        >
          <Icon size={18} className="text-[#78a9ff]" />
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-slate-500 uppercase font-medium mb-1">
            {stat.label}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold stat-value">
            {loading ? (
              <span className="text-slate-600">…</span>
            ) : (
              <CountUp value={stat.value} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WebsiteOverview({ data, loading }) {
  const stats = data?.stats;

  const overviewItems = [
    { label: "Projects", value: stats?.projects ?? 0, Icon: Briefcase, color: "from-purple-500/10 to-blue-500/10" },
    { label: "Services", value: stats?.services ?? 0, Icon: BarChart3, color: "from-cyan-500/10 to-blue-500/10" },
    { label: "Enquiries", value: stats?.enquiries ?? 0, Icon: Inbox, color: "from-amber-500/10 to-orange-500/10" },
    { label: "Views", value: stats?.views ?? 0, Icon: Eye, color: "from-green-500/10 to-emerald-500/10" },
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#78a9ff]" />
        <h3 className="text-lg font-semibold text-slate-200">
          Website Overview
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {overviewItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#78a9ff]/10 bg-[#0a1429]/50"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center border border-[#78a9ff]/20`}
              >
                <item.Icon size={16} className="text-[#78a9ff]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-500 text-xs">{item.label}</span>
                <span className="text-slate-200 font-bold text-lg">{item.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Recent Enquiries</span>
          <span className="text-slate-300 font-medium">
            {data?.recentEnquiries?.length ?? 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Recent Projects</span>
          <span className="text-slate-300 font-medium">
            {data?.recentProjects?.length ?? 0}
          </span>
        </div>
      </div>
    </Card>
  );
}

function RecentEnquiriesTable({ enquiries, loading }) {
  const formatPhone = (p) =>
    p ? p.replace(/[\s\-()]/g, "") : "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderEnquiryActions = (item) => {
    const phone = formatPhone(item.phone);
    return (
      <>
        {item.phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center p-1.5 rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-all"
            aria-label={`Call ${item.name}`}
            title="Call"
          >
            <Phone size={13} />
          </a>
        )}
        <a
          href={`mailto:${item.email}?subject=Regarding your enquiry`}
          className="flex items-center justify-center p-1.5 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all"
          aria-label={`Email ${item.name}`}
          title="Email"
        >
          <Mail size={13} />
        </a>
        {item.phone && (
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(
              `Hello ${item.name}, this is Rajratna Web Solutions regarding your enquiry.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-1.5 rounded-lg border border-[#22c58e]/20 text-[#22c58e] hover:bg-[#22c58e]/10 transition-all"
            aria-label={`WhatsApp ${item.name}`}
            title="WhatsApp"
          >
            <Send size={13} />
          </a>
        )}
      </>
    );
  };

  const renderEnquiryTableRow = (item) => {
    const Icon = statusIcons[item.status] || AlertCircle;
    const isNew = item.status === "New";
    const statusClass =
      statusColors[item.status] || statusColors["New"];

    return (
      <tr
        key={item._id}
        className="border-t border-white/5 hover:bg-white/[.02]"
      >
        <td className="py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isNew
                  ? "bg-[#78a9ff] shadow-[0_0_8px_rgba(120,169,255,.5)]"
                  : "bg-slate-600"
              }`}
            />
            <div className="min-w-0">
              <b
                className={`block truncate ${
                  isNew ? "text-white" : "text-slate-300"
                }`}
                title={item.name}
              >
                {item.name}
              </b>
              <span className="block text-xs text-slate-500 truncate">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        </td>
        <td className="py-3 text-slate-400">
          <div className="truncate" title={item.email}>
            {item.email}
          </div>
          {item.phone && (
            <div className="text-xs mt-0.5 truncate" title={item.phone}>
              {item.phone}
            </div>
          )}
        </td>
        <td className="py-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit whitespace-nowrap ${statusClass}`}
          >
            <Icon size={10} />
            {item.status}
          </span>
        </td>
        <td className="py-3">
          <div className="flex justify-end gap-1.5">
            {renderEnquiryActions(item)}
          </div>
        </td>
      </tr>
    );
  };

  const renderEnquiryCard = (item) => {
    const Icon = statusIcons[item.status] || AlertCircle;
    const isNew = item.status === "New";
    const statusClass =
      statusColors[item.status] || statusColors["New"];

    return (
      <div
        key={item._id}
        className="py-3 min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isNew
                ? "bg-[#78a9ff] shadow-[0_0_8px_rgba(120,169,255,.5)]"
                : "bg-slate-600"
            }`}
          />
          <b
            className={`flex-1 min-w-0 truncate block ${isNew ? "text-white" : "text-slate-300"}`}
            title={item.name}
          >
            {item.name}
          </b>
          <span className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <div className="text-sm text-slate-400 mt-1.5 space-y-0.5">
          <div className="truncate" title={item.email}>
            {item.email}
          </div>
          {item.phone && (
            <div className="text-xs truncate" title={item.phone}>
              {item.phone}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between mt-2.5 gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit whitespace-nowrap shrink-0 ${statusClass}`}
          >
            <Icon size={10} />
            {item.status}
          </span>
          <div className="flex flex-wrap justify-end gap-1 shrink-0">{renderEnquiryActions(item)}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-5 min-w-0 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Inbox size={17} className="text-[#78a9ff]" />
          <h3 className="text-lg font-semibold text-slate-200">
            Recent Enquiries
          </h3>
        </div>
        <Link
          to="/admin/enquiries"
          className="text-xs text-[#78a9ff] hover:text-blue-200 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="hidden xl:block">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr>
              <th className="text-left whitespace-nowrap w-[26%]">Customer</th>
              <th className="text-left whitespace-nowrap w-[30%]">Contact</th>
              <th className="text-left whitespace-nowrap w-[22%]">Status</th>
              <th className="text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <tr key={n}>
                  <td colSpan={4}>
                    <div className="h-12 bg-white/5 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  No enquiries yet.
                </td>
              </tr>
            ) : (
              enquiries.slice(0, 5).map((item) => renderEnquiryTableRow(item))
            )}
          </tbody>
        </table>
      </div>

      <div className="xl:hidden divide-y divide-white/5 min-w-0">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 bg-white/5 rounded animate-pulse" />
          ))
        ) : enquiries.length === 0 ? (
          <p className="text-center py-6 text-slate-500">No enquiries yet.</p>
        ) : (
          enquiries.slice(0, 5).map((item) => renderEnquiryCard(item))
        )}
      </div>
    </Card>
  );
}

function RecentProjectsTable({ projects, loading }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const renderProjectImage = (item, size = "w-10 h-10") => {
    if (item.imageUrl) {
      return (
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`${size} rounded-lg object-cover border border-white/10 shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-lg bg-gradient-to-br from-[#78a9ff]/20 to-[#3b82f6]/10 border border-[#78a9ff]/20 flex items-center justify-center shrink-0`}
      >
        <FolderKanban size={18} className="text-[#78a9ff]" />
      </div>
    );
  };

  const renderTechTags = (item) => (
    <div className="flex flex-wrap gap-1 min-w-0">
      {(item.technologies || []).slice(0, 2).map((tech) => (
        <span
          key={tech}
          className="text-xs px-2 py-0.5 rounded bg-[#78a9ff]/5 border border-[#78a9ff]/15 text-slate-400 max-w-full truncate"
        >
          {tech}
        </span>
      ))}
      {(item.technologies || []).length > 2 && (
        <span className="text-xs text-slate-600">
          +{item.technologies.length - 2}
        </span>
      )}
    </div>
  );

  const renderStatusBadge = (item) => (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap w-fit ${
        item.published
          ? "bg-green-500/15 text-green-300 border-green-500/30"
          : "bg-slate-500/15 text-slate-400 border-slate-500/30"
      }`}
    >
      {item.published ? "Published" : "Draft"}
    </span>
  );

  const renderProjectActions = (item) => (
    <>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center p-1.5 rounded-lg border border-[#78a9ff]/20 text-[#78a9ff] hover:bg-[#78a9ff]/10 transition-all"
          aria-label={`View ${item.name}`}
          title="View Project"
        >
          <ExternalLink size={13} />
        </a>
      )}
      <Link
        to="/admin/projects"
        className="flex items-center justify-center p-1.5 rounded-lg border border-[#78a9ff]/20 text-[#78a9ff] hover:bg-[#78a9ff]/10 transition-all"
        aria-label={`Edit ${item.name}`}
        title="Edit"
      >
        <span className="sr-only">Edit</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 3.5a2.5 2.5 0 1 1 3.5 3.5L12 19l-5 1 1-5z"></path>
        </svg>
      </Link>
    </>
  );

  const renderProjectTableRow = (item) => {
    return (
      <tr
        key={item._id}
        className="border-t border-white/5 hover:bg-white/[.02]"
      >
        <td className="py-3">
          <div className="flex items-center gap-3 min-w-0">
            {renderProjectImage(item)}
            <div className="min-w-0">
              <b className="text-slate-200 block truncate" title={item.name}>
                {item.name}
              </b>
              <span className="text-xs text-slate-500 block mt-0.5 truncate">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        </td>
        <td className="py-3">{renderTechTags(item)}</td>
        <td className="py-3">{renderStatusBadge(item)}</td>
        <td className="py-3">
          <div className="flex justify-end gap-1.5">
            {renderProjectActions(item)}
          </div>
        </td>
      </tr>
    );
  };

  const renderProjectCard = (item) => {
    return (
      <div
        key={item._id}
        className="py-3 min-w-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          {renderProjectImage(item)}
          <div className="flex-1 min-w-0">
            <b className="text-slate-200 block truncate" title={item.name}>
              {item.name}
            </b>
            <span className="text-xs text-slate-500 block mt-0.5">
              {formatDate(item.createdAt)}
            </span>
          </div>
        </div>

        {(item.technologies || []).length > 0 && (
          <div className="mt-2">{renderTechTags(item)}</div>
        )}

        <div className="flex flex-wrap items-center justify-between mt-2.5 gap-2">
          {renderStatusBadge(item)}
          <div className="flex flex-wrap justify-end gap-1 shrink-0">{renderProjectActions(item)}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-5 min-w-0 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderKanban size={17} className="text-[#78a9ff]" />
          <h3 className="text-lg font-semibold text-slate-200">
            Recent Projects
          </h3>
        </div>
        <Link
          to="/admin/projects"
          className="text-xs text-[#78a9ff] hover:text-blue-200 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="hidden xl:block">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr>
              <th className="text-left whitespace-nowrap w-[32%]">Project</th>
              <th className="text-left whitespace-nowrap w-[28%]">Technologies</th>
              <th className="text-left whitespace-nowrap w-[22%]">Status</th>
              <th className="text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((n) => (
                <tr key={n}>
                  <td colSpan={4}>
                    <div className="h-12 bg-white/5 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  No projects yet.
                </td>
              </tr>
            ) : (
              projects.slice(0, 5).map((item) => renderProjectTableRow(item))
            )}
          </tbody>
        </table>
      </div>

      <div className="xl:hidden divide-y divide-white/5 min-w-0">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-14 bg-white/5 rounded animate-pulse" />
          ))
        ) : projects.length === 0 ? (
          <p className="text-center py-6 text-slate-500">No projects yet.</p>
        ) : (
          projects.slice(0, 5).map((item) => renderProjectCard(item))
        )}
      </div>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: "Add New Project", icon: Briefcase, to: "/admin/projects" },
    { label: "Add Service", icon: BarChart3, to: "/admin/services" },
    { label: "View Enquiries", icon: Inbox, to: "/admin/enquiries" },
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={17} className="text-[#78a9ff]" />
        <h3 className="text-lg font-semibold text-slate-200">
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border border-[#78a9ff]/15 text-center text-sm font-medium text-slate-300 hover:text-white hover:bg-[#78a9ff]/5 hover:border-[#78a9ff]/30 transition-all group"
          >
            <Icon size={18} className="text-[#78a9ff] group-hover:scale-110 transition-transform" />
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

function DashboardHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <div className="label mb-1">CONTROL CENTER</div>
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-1">
        Dashboard
      </h1>
      <p className="text-slate-400 text-sm lg:text-base">
        Welcome back, Rajratna! Here's what's happening with your website today.
      </p>
      <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500 flex-wrap min-w-0">
        <Calendar size={14} className="shrink-0" />
        <span className="truncate min-w-0">{dateStr}</span>
        <span className="shrink-0">•</span>
        <Clock size={14} className="shrink-0" />
        <span className="shrink-0 whitespace-nowrap">{timeStr}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const [dashRes, enqRes, projRes] = await Promise.allSettled([
        admin.dashboard(),
        admin.enquiries.list(),
        admin.projects.list(),
      ]);

      if (dashRes.status === "fulfilled") {
        setData(dashRes.value.data.data);
      }
      if (enqRes.status === "fulfilled") {
        setEnquiries(enqRes.value.data.data || []);
      }
      if (projRes.status === "fulfilled") {
        setProjects(projRes.value.data.data || []);
      }

      if (dashRes.status === "rejected") {
        throw new Error(
          dashRes.reason?.response?.data?.message || "Dashboard data failed"
        );
      }
      setState("ready");
    } catch (e) {
      setState("error");
      setError(
        e.message ||
          "Dashboard data could not be loaded. Check that the API server is running."
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <DashboardHeader />

      {state === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          role="alert"
          className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 flex gap-3 text-red-100"
        >
          <TriangleAlert className="shrink-0" size={20} />
          <div>
            <b>Couldn't load the dashboard</b>
            <p className="text-sm mt-1 text-red-100/80">{error}</p>
            <button
              onClick={load}
              className="underline text-sm mt-3 hover:text-white"
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
      >
        {statCards.map((stat, i) => (
          <StatCard
            key={stat.key}
            stat={{
              ...stat,
              value: data?.stats?.[stat.key] ?? 0,
            }}
            index={i}
            loading={state === "loading"}
          />
        ))}
      </motion.div>

      {/* Website Overview */}
      <div className="mt-4">
        <WebsiteOverview data={data} loading={state === "loading"} />
      </div>

      {/* Quick Actions - full width on tablet, right column on desktop */}
      <div className="mt-4">
        <QuickActions />
      </div>

      {/* Recent Enquiries + Recent Projects */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <RecentEnquiriesTable
          enquiries={enquiries}
          loading={state === "loading"}
        />
        <RecentProjectsTable
          projects={projects}
          loading={state === "loading"}
        />
      </div>
    </>
  );
}
