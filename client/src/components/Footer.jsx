import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";

function WhatsAppIcon({ size = 14, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.56 0 .25 5.3.25 11.82c0 2.08.54 4.1 1.57 5.88L.15 24l6.47-1.7a11.8 11.8 0 0 0 5.46 1.34h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.13-3.4-8.34ZM12.08 21.65a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.84 1.01 1.03-3.74-.24-.38a9.8 9.8 0 0 1-1.51-5.15c0-5.42 4.41-9.83 9.84-9.83 2.62 0 5.08 1.02 6.94 2.88a9.77 9.77 0 0 1 2.88 6.95c0 5.42-4.4 9.84-9.74 9.84Zm5.39-7.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.08-1.76-.88-2.91-1.57-4.07-3.56-.3-.52.3-.48.87-1.6.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.3 1.26.48 1.7.61.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState({});
  const [settingsError, setSettingsError] = useState("");

  const loadSettings = useCallback(() => {
    pub.settings()
      .then((r) => {
        setSettings(r.data.data || {});
        setSettingsError("");
      })
      .catch(() => setSettingsError("Contact settings could not be loaded."));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useContentRefresh(loadSettings);

  const phone = settings.phone || "+91 9156914227";
  const email = settings.email || "rajratnawebsolutions@gmail.com";
  const location = settings.location || "Buldhana, Maharashtra, India";
  const siteTitle = settings.siteTitle || "RAJRATNA WEB SOLUTIONS";
  const whatsappMessage = "Hello Rajratna Web Solutions! 👋\n\nI came across your website and would like to discuss my project requirements.\n\nPlease let me know how we can get started.\n\nThank you!";
  const whatsappUrl = `https://wa.me/919156914227?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="border-t border-white/5 pt-14">
      {settingsError && <p className="container text-xs text-amber-300" role="status">{settingsError}</p>}
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="text-xl font-bold text-white">{siteTitle}</span>
            <p className="muted text-sm mt-3 leading-7">
              Building modern, responsive and high-performing web experiences.
            </p>
          </div>

          <div>
            <b className="block text-sm font-medium text-slate-400 mb-3">Pages</b>
            <div className="flex flex-col gap-2 text-sm">
              {[
                ["/", "Home"],
                ["/about", "About"],
                ["/services", "Services"],
                ["/portfolio", "Portfolio"],
                ["/technologies", "Technologies"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="text-slate-300 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <b className="block text-sm font-medium text-slate-400 mb-3">Contact</b>
            <div className="flex flex-col gap-3 text-sm">
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex gap-2 text-slate-300 hover:text-white">
                <Phone size={14} className="text-[#78a9ff]" />
                <span>{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex gap-2 text-slate-300 hover:text-white break-all">
                <Mail size={14} className="text-[#78a9ff]" />
                <span>{email}</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex gap-2 text-slate-300 hover:text-white">
                <WhatsAppIcon className="text-[#78a9ff] shrink-0" />
                <span>WhatsApp</span>
              </a>
              <div className="flex gap-2">
                <MapPin size={14} className="text-[#78a9ff] shrink-0" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          <div>
            <b className="block text-sm font-medium text-slate-400 mb-3">Tagline</b>
            <p className="text-sm text-slate-300 leading-7">Your Vision | Our Code</p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-3">
          <span>© {new Date().getFullYear()} RAJRATNA WEB SOLUTIONS. All rights reserved.</span>
          <span>Website Design & Development</span>
        </div>
      </div>
    </footer>
  );
}
