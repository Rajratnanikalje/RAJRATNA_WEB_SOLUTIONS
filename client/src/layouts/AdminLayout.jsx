import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  Briefcase,
  Cpu,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  ChevronDown,
  Search,
  X,
  House,
  UserRound,
  Workflow,
  CircleHelp,
  MessageSquareQuote,
  FileText,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { admin, NEW_ENQUIRY_SIGNAL_KEY } from "../services/api";

const navGroups = [
  ["DASHBOARD", [["dashboard", "Dashboard", LayoutDashboard]]],
  [
    "WEBSITE",
    [
      ["navbar", "Navbar", Settings],
      ["homepage", "Homepage", House],
      ["about", "About", UserRound],
      ["services", "Services", Briefcase],
      ["projects", "Projects", FolderKanban],
      ["process", "Process", Workflow],
      ["technologies", "Technologies", Cpu],
      ["footer", "Footer", Settings],
      ["faq", "FAQ", CircleHelp],
      ["testimonials", "Testimonials", MessageSquareQuote],
    ],
  ],
  ["LEADS", [["enquiries", "Enquiries", Inbox]]],
  [
    "SETTINGS",
    [
      ["website-settings", "Website Settings", Settings],
      ["contact-social", "Contact & Social", Share2],
      ["seo", "SEO", Search],
      ["privacy", "Privacy Policy", FileText],
      ["terms", "Terms & Conditions", FileText],
    ],
  ],
];

function NotificationBell({
  count,
  items,
  showNotif,
  setShowNotif,
  onNotifClick,
  markAllRead,
  notifRef,
}) {
  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowNotif(!showNotif);
        }}
        className="relative p-3 rounded-xl text-slate-300 hover:text-white hover:bg-[#78a9ff]/5 transition-all group"
        aria-label="Notifications"
      >
        {count > 0 ? (
          <BellRing
            size={20}
            className="text-[#78a9ff] group-hover:animate-pulse"
          />
        ) : (
          <Bell size={20} />
        )}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] text-[8px] font-bold text-slate-900 rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-[-48px] sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 rounded-2xl border border-[#78a9ff]/20 bg-[#0a1429]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(120,169,255,.15)] z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">
                New enquiries
              </span>
              {count > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#78a9ff] hover:text-blue-200"
                >
                  Mark all read
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No new enquiries.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {items.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => onNotifClick(n)}
                    className="p-3 border-b border-white/5 last:border-0 cursor-pointer transition-all hover:bg-[#78a9ff]/5"
                  >
                    <b className="text-sm text-slate-200 block">{n.name}</b>
                    <p className="text-xs text-slate-400 mt-1 break-words">
                      {n.message?.substring(0, 80)}...
                    </p>
                    <div className="flex gap-2 mt-2">
                      {n.phone && (
                        <a
                          href={`tel:${n.phone.replace(/[\s\-()]/g, "")}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#78a9ff] hover:text-blue-200"
                        >
                          Call
                        </a>
                      )}
                      <a
                        href={`mailto:${n.email}?subject=Regarding your enquiry`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#78a9ff] hover:text-blue-200"
                      >
                        Email
                      </a>
                      {n.phone && (
                        <a
                          href={`https://wa.me/${n.phone.replace(
                            /[\s\-()]/g,
                            "",
                          )}?text=${encodeURIComponent(
                            `Hello ${n.name}, this is Rajratna Web Solutions regarding your enquiry.`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#78a9ff] hover:text-blue-200"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 glass px-3 py-2 rounded-2xl border border-white/10 hover:border-[#78a9ff]/30 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(120,169,255,.3)]">
          <User size={16} className="text-slate-900" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-slate-200">
            Rajratna Nikalje
          </div>
          <div className="text-xs text-slate-500">Admin</div>
        </div>
        <ChevronDown
          size={14}
          className="text-slate-500 transition-transform group-hover:text-[#78a9ff]"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#78a9ff]/20 bg-[#0a1429]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(120,169,255,.15)] z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(120,169,255,.3)]">
                  <User size={18} className="text-slate-900" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Rajratna Nikalje
                  </div>
                  <div className="text-xs text-slate-500">Admin</div>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <a
                href="/admin/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-[#78a9ff]/10 transition-all"
              >
                <Settings size={14} />
                Settings
              </a>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-[#78a9ff]/10 transition-all text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarNav({ onNavigate }) {
  return (
    <>
      {navGroups.map(([group, links]) => (
        <section key={group || "dashboard"} className={group ? "mt-3" : ""}>
          {group && (
            <div className="px-3 mb-1">
              <span className="text-[10px] font-semibold text-slate-600 tracking-wider">
                {group}
              </span>
            </div>
          )}
          <nav className="grid gap-1 px-2">
            {links.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/admin/${path}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#78a9ff]/15 to-[#3b82f6]/10 text-[#78a9ff] border border-[#78a9ff]/30 shadow-[0_0_12px_rgba(120,169,255,.15)]"
                      : "text-slate-400 hover:text-white hover:bg-[#78a9ff]/5"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </section>
      ))}
    </>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef(null);
  const notificationsLoadedRef = useRef(false);
  const knownNotificationIdsRef = useRef(new Set());

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const logout = () => {
    localStorage.removeItem("rws_token");
    navigate("/admin/login", { replace: true });
  };

  const fetchNotifications = async () => {
    try {
      const r = await admin.enquiries.list();
      const all = r.data.data || [];
      const currentNew = all.filter(
        (e) => e.status === "New" || e.status === "NEW",
      );
      let seen = [];
      try {
        seen = JSON.parse(localStorage.getItem("rws_seen_enquiry_ids") || "[]");
      } catch {
        // A corrupted browser value must not prevent new enquiry alerts.
      }
      const seenSet = new Set(Array.isArray(seen) ? seen : []);
      const unseen = currentNew.filter((e) => !seenSet.has(e._id));
      const hasNewNotification = unseen.some(
        (item) => !knownNotificationIdsRef.current.has(item._id),
      );
      knownNotificationIdsRef.current = new Set(unseen.map((item) => item._id));
      setNotifications(unseen);
      // Open the notification list immediately when the panel loads with new
      // enquiries, and again only when a genuinely new enquiry arrives.
      if (
        unseen.length &&
        (!notificationsLoadedRef.current || hasNewNotification)
      ) {
        setShowNotif(true);
      }
      notificationsLoadedRef.current = true;
    } catch {
      // Keep the existing notification state if the API is temporarily unavailable.
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    const refreshOnStorage = (event) => {
      if (event.key === NEW_ENQUIRY_SIGNAL_KEY) fetchNotifications();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    window.addEventListener("focus", fetchNotifications);
    window.addEventListener("rws:new-enquiry", fetchNotifications);
    window.addEventListener("storage", refreshOnStorage);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", fetchNotifications);
      window.removeEventListener("rws:new-enquiry", fetchNotifications);
      window.removeEventListener("storage", refreshOnStorage);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("pointerdown", onOutsideClick);
    return () => document.removeEventListener("pointerdown", onOutsideClick);
  }, []);

  const handleNotifClick = (enquiry) => {
    setShowNotif(false);
    const seen = JSON.parse(
      localStorage.getItem("rws_seen_enquiry_ids") || "[]",
    );
    const nextSeen = Array.from(
      new Set([...(Array.isArray(seen) ? seen : []), enquiry._id]),
    );
    localStorage.setItem("rws_seen_enquiry_ids", JSON.stringify(nextSeen));
    setNotifications((items) =>
      items.filter((item) => item._id !== enquiry._id),
    );
    sessionStorage.setItem("flashEnquiryId", enquiry._id);
    navigate("/admin/enquiries");
  };

  const markAllRead = () => {
    const seen = JSON.parse(
      localStorage.getItem("rws_seen_enquiry_ids") || "[]",
    );
    const nextSeen = Array.from(
      new Set([
        ...(Array.isArray(seen) ? seen : []),
        ...notifications.map((item) => item._id),
      ]),
    );
    localStorage.setItem("rws_seen_enquiry_ids", JSON.stringify(nextSeen));
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  return (
    <div className="admin-shell min-h-screen relative">
      <div className="admin-grid pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:w-64 lg:z-40 lg:flex">
        <div className="glass-premium rounded-3xl m-4 p-4 w-full h-[calc(100vh-32px)] flex flex-col border border-[#78a9ff]/10">
          {/* Branding */}
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center shadow-[0_0-20px_rgba(120,169,255,.4)]">
              <Sparkles size={20} className="text-slate-900" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-200 leading-tight">
                RAJRATNA
                <span className="text-[#78a9ff] block text-sm font-semibold">
                  WEB SOLUTIONS
                </span>
              </div>
              <div className="text-xs text-slate-600 tracking-wider">
                Your Vision | Our Code
              </div>
            </div>
          </div>

          <div className="admin-sidebar-scroll mt-4 flex-1 min-h-0 overflow-y-auto">
            <SidebarNav onNavigate={() => {}} />
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="order-last flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-[#78a9ff]/5 transition-all mb-3"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 glass-premium rounded-b-2xl border-b border-[#78a9ff]/10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#78a9ff]/5 transition-all"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center">
              <Sparkles size={16} className="text-slate-900" />
            </div>
            <b className="text-lg text-slate-300">
              RAJRATNA <span className="text-[#78a9ff]">CMS</span>
            </b>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              count={unreadCount}
              items={notifications}
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              onNotifClick={handleNotifClick}
              markAllRead={markAllRead}
              notifRef={notifRef}
            />
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#78a9ff]/5 transition-all"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-30 mb-6">
        <div className="flex justify-between items-center px-6 py-3 ml-64 bg-[#0a1429]/90 backdrop-blur-xl border-b border-[#78a9ff]/10">
          {/* Search */}
          <div className="relative w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              placeholder="Search anything..."
              className="input pl-10 w-full text-sm h-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-600">
              <span className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700">
                ⌘
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700">
                K
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell
              count={unreadCount}
              items={notifications}
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              onNotifClick={handleNotifClick}
              markAllRead={markAllRead}
              notifRef={notifRef}
            />
            <ProfileDropdown onLogout={logout} />
          </div>
        </div>
      </header>

      <main className="lg:ml-64 p-5 lg:p-8 w-full lg:w-[calc(100%-256px)] pt-16 lg:pt-10 pb-20 min-w-0">
        <Outlet />
      </main>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 bg-black/60 z-[50] lg:hidden cursor-default"
            onPointerDown={() => setMobileOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 w-[280px] sm:w-64 z-[60] lg:hidden p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            <div className="admin-sidebar-scroll glass-premium rounded-3xl p-3 sm:p-4 w-[280px] sm:w-64 h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] flex flex-col border border-[#78a9ff]/10 overflow-y-auto">
              <div className="flex items-center justify-between p-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center">
                    <Sparkles size={16} className="text-slate-900" />
                  </div>
                  <b className="text-xl text-slate-300">
                    RAJRATNA <span className="text-[#78a9ff]">CMS</span>
                  </b>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#78a9ff]/5 transition-all"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-2 flex-1 min-h-0">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="order-last flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-[#78a9ff]/5 transition-all mb-4"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
