import { useCallback, useEffect, useState } from "react";
import useContentRefresh from "../hooks/useContentRefresh";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pub } from "../services/api";
import { publicPath } from "../content/siteRoutes";

const defaultLinks = [
  ["home", "Home"], ["about", "About"], ["services", "Services"],
  ["projects", "Projects"], ["process", "Process"], ["contact", "Contact"],
].map(([routeKey, label], displayOrder) => ({ routeKey, label, visible: true, displayOrder }));
const defaultSiteTitle = "RAJRATNA WEB SOLUTIONS";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [settingsError, setSettingsError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const goHome = () => { setOpen(false); window.scrollTo({ top: 0, left: 0, behavior: "auto" }); };
  const loadSettings = useCallback(() => {
    void pub.settings().then((r) => { setSettings(r.data?.data || {}); setSettingsError(""); })
      .catch(() => setSettingsError("Site settings could not be loaded."));
  }, []);
  useEffect(loadSettings, [loadSettings]);
  useContentRefresh(loadSettings);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const links = (settings.navbarItems || defaultLinks).filter((item) => item.visible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const logoUrl = settings.logoUrl || "";
  const siteTitle = settings.siteTitle || defaultSiteTitle;
  const brandPrimaryText = settings.brandPrimaryText || "RAJRATNA .";
  const brandSecondaryText = settings.brandSecondaryText || "WEB SOLUTIONS";
  const ctaVisible = settings.navbarCtaVisible !== false;
  const ctaText = settings.navbarCtaText || "Start a Project";
  const ctaPath = publicPath(settings.navbarCtaRouteKey || "contact", "/contact");

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#08111f]/90 backdrop-blur-xl shadow-lg shadow-black/10" : "bg-transparent"}`}>
      {settingsError && <span className="sr-only" role="status">{settingsError}</span>}
      <div className="container border-b border-white/5">
        <div className="h-[76px] flex items-center justify-between">
          <Link to="/" onClick={goHome} className="flex items-center gap-3 leading-none">
            {logoUrl && <img src={logoUrl} alt={`${siteTitle} logo`} className="h-11 w-auto max-w-[110px] object-contain shrink-0" />}
            <span>
              <span className="text-xl font-bold text-white block">{brandPrimaryText}</span>
              <span className="block text-[9px] tracking-[.26em] text-slate-500 mt-0.5">{brandSecondaryText}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8 text-[13px] font-medium text-slate-300" aria-label="Main navigation">
            {links.map((item) => {
              const to = publicPath(item.routeKey);
              return <NavLink key={`${item.routeKey}-${item.label}`} to={to} end={to === "/"} onClick={item.routeKey === "home" ? goHome : undefined} className={({ isActive }) => isActive ? "text-[#78a9ff]" : "hover:text-white transition-colors"}>{item.label}</NavLink>;
            })}
          </nav>

          {ctaVisible && <Link to={ctaPath} className="primary !hidden lg:!inline-flex text-xs py-3">{ctaText} <ArrowUpRight size={14} /></Link>}
          <button className="lg:hidden inline-flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      <AnimatePresence>
        {open && <motion.div className="lg:hidden absolute top-full left-0 right-0 glass border-t border-white/10" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <nav className="container relative z-10 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((item) => { const to = publicPath(item.routeKey); return <Link key={`${item.routeKey}-${item.label}`} to={to} onClick={item.routeKey === "home" ? goHome : () => setOpen(false)} className="min-h-12 flex items-center py-3 px-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-[#78a9ff]/10 transition-colors">{item.label}</Link>; })}
            {ctaVisible && <Link to={ctaPath} onClick={() => setOpen(false)} className="primary min-h-12 text-sm justify-center mt-2">{ctaText} <ArrowUpRight size={14} /></Link>}
          </nav>
        </motion.div>}
      </AnimatePresence>
      {open && <div className="lg:hidden fixed inset-0 z-[-1] touch-none" onClick={() => setOpen(false)} />}
    </header>
  );
}
