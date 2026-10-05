import { useCallback, useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import useContentRefresh from "../hooks/useContentRefresh";
import { pub } from "../services/api";
import { withWhatsAppMessage } from "../utils/whatsapp";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="27" height="27" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.56 0 .25 5.3.25 11.82c0 2.08.54 4.1 1.57 5.88L.15 24l6.47-1.7a11.8 11.8 0 0 0 5.46 1.34h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.13-3.4-8.34ZM12.08 21.65a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.84 1.01 1.03-3.74-.24-.38a9.8 9.8 0 0 1-1.51-5.15c0-5.42 4.41-9.83 9.84-9.83 2.62 0 5.08 1.02 6.94 2.88a9.77 9.77 0 0 1 2.88 6.95c0 5.42-4.4 9.84-9.74 9.84Zm5.39-7.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.08-1.76-.88-2.91-1.57-4.07-3.56-.3-.52.3-.48.87-1.6.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.3 1.26.48 1.7.61.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function FloatingContactActions() {
  const [settings, setSettings] = useState({});
  const loadSettings = useCallback(() => {
    void pub.settings().then((r) => setSettings(r.data?.data || {})).catch(() => {});
  }, []);
  useEffect(loadSettings, [loadSettings]);
  useContentRefresh(loadSettings);

  const phone = settings.footerPhone || settings.phone || "";
  const email = settings.footerEmail || settings.email || "";
  const whatsapp = settings.footerWhatsapp || settings.whatsapp || phone;
  const whatsappHref = withWhatsAppMessage(
    /^https?:\/\//i.test(whatsapp)
      ? whatsapp
      : settings.contactWhatsappUrl || whatsapp.replace(/\D/g, ""),
  );
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";

  return (
    <nav className="floating-contact-actions" aria-label="Quick contact">
      <a className="floating-contact-action floating-contact-action--whatsapp" href={whatsappHref || undefined} target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp">
        <WhatsAppIcon />
      </a>
      <a className="floating-contact-action floating-contact-action--call" href={phoneHref || undefined} aria-label="Call us">
        <Phone size={26} strokeWidth={2.2} aria-hidden="true" />
      </a>
      <a className="floating-contact-action floating-contact-action--email" href={email ? `mailto:${email}` : undefined} aria-label="Email us">
        <Mail size={26} strokeWidth={2.2} aria-hidden="true" />
      </a>
    </nav>
  );
}
