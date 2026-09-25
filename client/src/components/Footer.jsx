import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { publicPath } from "../content/siteRoutes";
import { withWhatsAppMessage } from "../utils/whatsapp";

function WhatsAppIcon({ size = 14, className = "" }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}><path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.56 0 .25 5.3.25 11.82c0 2.08.54 4.1 1.57 5.88L.15 24l6.47-1.7a11.8 11.8 0 0 0 5.46 1.34h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.13-3.4-8.34ZM12.08 21.65a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.84 1.01 1.03-3.74-.24-.38a9.8 9.8 0 0 1-1.51-5.15c0-5.42 4.41-9.83 9.84-9.83 2.62 0 5.08 1.02 6.94 2.88a9.77 9.77 0 0 1 2.88 6.95c0 5.42-4.4 9.84-9.74 9.84Zm5.39-7.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.08-1.76-.88-2.91-1.57-4.07-3.56-.3-.52.3-.48.87-1.6.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.3 1.26.48 1.7.61.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" /></svg>;
}

const defaultQuickLinks = [["Home", "home"], ["About", "about"], ["Services", "services"], ["Projects", "projects"], ["Process", "process"], ["Technologies", "technologies"], ["Contact", "contact"], ["Privacy Policy", "privacy"], ["Terms & Conditions", "terms"]].map(([label, routeKey], displayOrder) => ({ label, routeKey, visible: true, displayOrder }));
const defaultServiceLinks = [["Websites & Web Applications", "services"], ["E-Commerce & Dashboards", "services"], ["APIs & Integrations", "services"]].map(([label, routeKey], displayOrder) => ({ label, routeKey, visible: true, displayOrder }));

export default function Footer() {
  const [settings, setSettings] = useState({});
  const loadSettings = useCallback(() => { void pub.settings().then((r) => setSettings(r.data.data || {})).catch(() => {}); }, []);
  useEffect(loadSettings, [loadSettings]);
  useContentRefresh(loadSettings);

  const phone = settings.footerPhone || settings.phone || "+91 9156914227";
  const email = settings.footerEmail || settings.email || "rajratnawebsolutions@gmail.com";
  const location = settings.footerLocation || settings.location || "Buldhana, Maharashtra, India";
  const siteTitle = settings.siteTitle || "RAJRATNA WEB SOLUTIONS";
  const whatsappValue = settings.footerWhatsapp || settings.whatsapp || phone;
  const digits = whatsappValue.replace(/\D/g, "");
  const whatsappHref = withWhatsAppMessage(/^https?:\/\//i.test(whatsappValue) ? whatsappValue : settings.contactWhatsappUrl || digits);
  const socialLinks = (Array.isArray(settings.footerSocialLinks) ? settings.footerSocialLinks : Array.isArray(settings.socialLinks) ? settings.socialLinks : []).filter((url) => /^https?:\/\//i.test(url));
  const quickLinks = (settings.footerQuickLinks || defaultQuickLinks).filter((item) => item.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const serviceLinks = (settings.footerServiceLinks || defaultServiceLinks).filter((item) => item.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const copyright = (settings.footerCopyrightText || "© {year} RAJRATNA WEB SOLUTIONS. All rights reserved.").replaceAll("{year}", String(new Date().getFullYear())).replaceAll("{siteTitle}", siteTitle);
  const columns = [settings.footerBrandVisible !== false, settings.footerQuickLinksVisible !== false, settings.footerServicesVisible !== false, settings.footerContactVisible !== false].filter(Boolean).length;
  const gridClass = columns >= 4 ? "lg:grid-cols-4" : columns === 3 ? "lg:grid-cols-3" : columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1";

  return <footer className="border-t border-white/5 pt-14"><div className="container">
    <div className={`grid sm:grid-cols-2 ${gridClass} gap-10`}>
      {settings.footerBrandVisible !== false && <div>
        <Link to="/" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })} className="inline-flex items-center gap-3">
          {(settings.footerLogoUrl || settings.logoUrl) && <img src={settings.footerLogoUrl || settings.logoUrl} alt={`${siteTitle} logo`} loading="lazy" className="h-10 max-w-24 object-contain" />}
          <span><b className="block text-xl font-bold text-white">{settings.brandPrimaryText || "RAJRATNA ."}</b><span className="text-[9px] tracking-[.13em] text-slate-500">{settings.brandSecondaryText || "WEB SOLUTIONS"}</span></span>
        </Link>
        <p className="muted text-sm mt-3 leading-7">{settings.footerDescription || "Modern websites, full-stack applications and digital solutions for businesses."}</p>
        {settings.footerSocialVisible !== false && !!socialLinks.length && <div className="flex flex-wrap gap-3 mt-5">{socialLinks.map((url) => { let label = "Social"; try { label = new URL(url).hostname.replace(/^www\./, ""); } catch {} return <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">{label}</a>; })}</div>}
      </div>}
      {settings.footerQuickLinksVisible !== false && <div><b className="block text-sm font-medium text-slate-400 mb-3">{settings.footerQuickLinksHeading || "Pages"}</b><div className="flex flex-col gap-2 text-sm">{quickLinks.map((item, index) => <Link key={`${item.routeKey}-${index}`} to={publicPath(item.routeKey)} onClick={item.routeKey === "home" ? () => window.scrollTo({ top: 0, left: 0, behavior: "auto" }) : undefined} className="text-slate-300 hover:text-white transition-colors">{item.routeKey === "privacy" ? settings.footerPrivacyLabel || item.label : item.routeKey === "terms" ? settings.footerTermsLabel || item.label : item.label}</Link>)}</div></div>}
      {settings.footerServicesVisible !== false && <div><b className="block text-sm font-medium text-slate-400 mb-3">{settings.footerServicesHeading || "What We Build"}</b><div className="flex flex-col gap-2 text-sm text-slate-300">{serviceLinks.map((item, index) => <span key={`${item.label}-${index}`}>{item.label}</span>)}</div></div>}
      {settings.footerContactVisible !== false && <div><b className="block text-sm font-medium text-slate-400 mb-3">{settings.footerContactHeading || "Contact"}</b><div className="flex flex-col gap-3 text-sm">{settings.footerShowPhone !== false && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex gap-2 text-slate-300 hover:text-white"><Phone size={14} className="text-[#78a9ff] shrink-0"/><span>{phone}</span></a>}{settings.footerShowEmail !== false && <a href={`mailto:${email}`} className="flex gap-2 text-slate-300 hover:text-white break-all"><Mail size={14} className="text-[#78a9ff] shrink-0"/><span>{email}</span></a>}{settings.footerShowWhatsapp !== false && whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex gap-2 text-slate-300 hover:text-white"><WhatsAppIcon className="text-[#78a9ff] shrink-0"/><span>{settings.footerWhatsappLabel || "WhatsApp"}</span></a>}{settings.footerShowLocation !== false && <div className="flex gap-2 text-slate-300"><MapPin size={14} className="text-[#78a9ff] shrink-0"/><span>{location}</span></div>}</div></div>}
    </div>
    <div className="border-t border-white/5 mt-12 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-3"><span>{copyright}</span><span>{settings.footerTagline || "Website Design & Development"}</span></div>
  </div></footer>;
}
