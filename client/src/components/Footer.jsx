import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";

export default function Footer() {
  const [settings, setSettings] = useState({});

  const loadSettings = useCallback(() => {
    pub.settings().then((r) => setSettings(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useContentRefresh(loadSettings);

  const phone = settings.phone || "+91 9156914227";
  const email = settings.email || "rajratnaofficial7252@gmail.com";
  const location = settings.location || "Buldhana, Maharashtra, India";

  return (
    <footer className="border-t border-white/5 pt-14">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="text-xl font-bold text-white">
              RAJRATNA <span className="text-[#78a9ff]">.</span>
            </span>
            <p className="muted text-sm mt-3 leading-7">
              Building modern, responsive and high-performing web experiences.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href={`mailto:${email}`}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 transition-all"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 transition-all"
                aria-label="Call"
              >
                <Phone size={15} />
              </a>
            </div>
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
