import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import {
  defaultCountries,
  parseCountry,
  PhoneInput,
} from "react-international-phone";
import "react-international-phone/style.css";
import { withWhatsAppMessage } from "../utils/whatsapp";
import { notifyEnquiryCreated, pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

const initialState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  message: "",
};
const countries = defaultCountries.map(parseCountry);
const india = countries.find((country) => country.iso2 === "in");

const countryFlag = (iso2) =>
  iso2
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");

function InternationalPhoneField({
  value,
  onChange,
  country,
  onCountryChange,
  placeholder = "Phone number",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selectorRef = useRef(null);
  const searchRef = useRef(null);
  const phoneInputRef = useRef(null);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    const dialCodeQuery = query.replace(/[^\d]/g, "");
    if (!query) return countries;
    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (dialCodeQuery && item.dialCode.includes(dialCodeQuery)),
    );
  }, [search]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!selectorRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    requestAnimationFrame(() => searchRef.current?.focus());
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  const selectCountry = (nextCountry) => {
    onCountryChange(nextCountry);
    phoneInputRef.current?.setCountry(nextCountry.iso2);
    onChange(`+${nextCountry.dialCode}`);
    setSearch("");
    setIsOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      selectCountry(results[activeIndex]);
    }
  };

  return (
    <div className="contact-phone-field">
      <div className="contact-country-selector" ref={selectorRef}>
        <button
          type="button"
          className="contact-country-trigger"
          aria-label={`Selected country: ${country.name}, +${country.dialCode}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (["ArrowDown", "Enter", " "].includes(event.key)) {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <span aria-hidden="true">{countryFlag(country.iso2)}</span>
          <span className="contact-country-code">+{country.dialCode}</span>
          <span className="contact-country-chevron" aria-hidden="true">
            ⌄
          </span>
        </button>

        {isOpen && (
          <div className="contact-country-menu">
            <input
              ref={searchRef}
              type="search"
              className="contact-country-search"
              placeholder="Search country or code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search country by name or calling code"
            />
            <div
              className="contact-country-results"
              role="listbox"
              aria-label="Countries"
            >
              {results.length ? (
                results.map((item, index) => (
                  <button
                    type="button"
                    key={item.iso2}
                    role="option"
                    aria-selected={item.iso2 === country.iso2}
                    className={`contact-country-option${index === activeIndex ? " is-active" : ""}`}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => selectCountry(item)}
                  >
                    <span className="contact-country-flag" aria-hidden="true">
                      {countryFlag(item.iso2)}
                    </span>
                    <span className="contact-country-name">{item.name}</span>
                    <span className="contact-country-option-code">
                      +{item.dialCode}
                    </span>
                  </button>
                ))
              ) : (
                <p className="contact-country-empty" role="status">
                  No countries found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <PhoneInput
        ref={phoneInputRef}
        key={country.iso2}
        defaultCountry={country.iso2}
        value={value}
        onChange={(phone, meta) => {
          onCountryChange(meta.country);
          onChange(phone);
        }}
        forceDialCode
        disableCountryGuess
        disableDialCodeAndPrefix
        showDisabledDialCodeAndPrefix
        disableFocusAfterCountrySelect
        className="contact-phone-input"
        countrySelectorStyleProps={{
          className: "contact-phone-library-selector",
        }}
        inputClassName="contact-phone-number-input"
        inputProps={{
          id: "contact-phone",
          "aria-label": "Phone number",
          autoComplete: "tel",
          maxLength: 30,
          required: true,
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState(initialState);
  const [settings, setSettings] = useState({});
  const [settingsError, setSettingsError] = useState("");
  const [status, setStatus] = useState({ busy: false, error: "", ok: "" });
  const [phoneCountry, setPhoneCountry] = useState(india);
  const [services, setServices] = useState([]);
  const loadContactSettings = useCallback(() => {
    pub
      .settings()
      .then((r) => {
        setSettings(r.data.data || {});
        setSettingsError("");
      })
      .catch(() =>
        setSettingsError(
          "Contact details are temporarily unavailable; you can still send an enquiry.",
        ),
      );
  }, []);

  useEffect(() => {
    loadContactSettings();
  }, [loadContactSettings]);

  useContentRefresh(loadContactSettings);

  useEffect(() => {
    const loadServices = () =>
      pub
        .services()
        .then((r) => setServices(r.data?.data || []))
        .catch(() => {});
    loadServices();
    const onUpdated = () => loadServices();
    window.addEventListener("rws:content-updated", onUpdated);
    return () => window.removeEventListener("rws:content-updated", onUpdated);
  }, []);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim()))
      return "Please enter a valid email address.";
    const phoneDigits = form.phone.replace(/\D/g, "");
    const hasPhoneNumber = phoneDigits && phoneDigits !== phoneCountry.dialCode;
    if (!hasPhoneNumber) return "Phone number is required.";
    if (!form.message.trim()) return "Message is required.";
    if (form.message.trim().length > 5000)
      return "Message is too long (max 5000 characters).";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ busy: false, error: err, ok: "" });
      return;
    }
    setStatus({ busy: true, error: "", ok: "" });
    try {
      await pub.enquiry({
        ...form,
        email: form.email.trim(),
        country: phoneCountry.iso2,
      });
      notifyEnquiryCreated();
      setForm(initialState);
      setPhoneCountry(india);
      setStatus({
        busy: false,
        error: "",
        ok:
          settings.contactSuccessMessage ||
          "Your enquiry has been received. We'll get back to you soon.",
      });
    } catch (x) {
      setStatus({
        busy: false,
        error:
          x.response?.data?.message ||
          "Unable to send enquiry. Please try again.",
        ok: "",
      });
    }
  };

  const contacts = [
    {
      icon: Phone,
      label: settings.contactPhoneLabel || "Phone",
      value: settings.phone || "+91 9156914227",
    },
    {
      icon: Mail,
      label: settings.contactEmailLabel || "Email",
      value: settings.email || "rajratnawebsolutions@gmail.com",
    },
    {
      icon: MapPin,
      label: settings.contactLocationLabel || "Location",
      value: settings.location || "Buldhana, Maharashtra, India",
    },
  ];
  const whatsappSetting =
    settings.whatsapp || settings.phone || "+91 9156914227";
  const whatsappPhone = whatsappSetting.replace(/\D/g, "");
  const whatsappUrl = withWhatsAppMessage(
    settings.contactWhatsappUrl ||
      (/^https?:\/\//i.test(whatsappSetting) ? whatsappSetting : whatsappPhone),
  );
  let whatsappDisplaySource = whatsappSetting;
  if (/^https?:\/\//i.test(whatsappDisplaySource)) {
    try {
      whatsappDisplaySource =
        new URL(whatsappDisplaySource).pathname
          .split("/")
          .filter(Boolean)
          .pop() ||
        settings.phone ||
        "+91 9156914227";
    } catch {
      whatsappDisplaySource = settings.phone || "+91 9156914227";
    }
  }
  const whatsappDisplayDigits = whatsappDisplaySource.replace(/\D/g, "");
  const whatsappDisplayNumber =
    whatsappDisplayDigits.length === 12 &&
    whatsappDisplayDigits.startsWith("91")
      ? `+91 ${whatsappDisplayDigits.slice(2)}`
      : whatsappDisplayDigits.length === 10
        ? `+91 ${whatsappDisplayDigits}`
        : whatsappDisplayDigits
          ? `+${whatsappDisplayDigits}`
          : "+91 9156914227";
  if (whatsappUrl)
    contacts.push({
      icon: MessageCircle,
      label: settings.contactWhatsappLabel || "WhatsApp",
      value: whatsappDisplayNumber,
    });
  const serviceOptions = [
    ...new Set(
      [
        ...services.map((service) => service.title),
        settings.contactOtherServiceLabel || "Other",
      ].filter(Boolean),
    ),
  ];

  return settings.contactPageVisible === false ? null : (
    <section className="section contact-section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label={settings.contactEyebrow || "CONTACT"}
            title={settings.contactTitle || "Send Us a Message"}
            desc={
              settings.contactDescription ||
              "Tell us what you need and our team will get back to you."
            }
          />
        </Reveal>
        {settingsError && (
          <p className="text-amber-300 text-sm mt-4" role="status">
            {settingsError}
          </p>
        )}

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 mt-12 contact-grid">
          <Reveal>
            <div className="space-y-5">
              <Card className="p-7 space-y-6 contact-info-card">
                {contacts.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-slate-900" />
                      </div>
                      <div className="min-w-0">
                        <b className="block text-sm text-slate-400">
                          {c.label}
                        </b>
                        {c.icon === MessageCircle ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="muted text-sm mt-1 break-words block"
                          >
                            {c.value}
                          </a>
                        ) : (
                          <span className="muted text-sm mt-1 break-words">
                            {c.value}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!!settings.socialLinks?.length && (
                  <div className="border-t border-white/10 pt-5">
                    <b className="block text-sm text-slate-400 mb-3">
                      {settings.contactSocialLabel || "Social"}
                    </b>
                    <div className="flex flex-wrap gap-3">
                      {settings.socialLinks
                        .filter((url) => /^https?:\/\//i.test(url))
                        .map((url) => {
                          let label = "Social";
                          try {
                            label = new URL(url).hostname.replace(/^www\./, "");
                          } catch {}
                          return (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-[#78a9ff] hover:text-white"
                            >
                              {label}
                            </a>
                          );
                        })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <Card className="p-7 contact-form-card">
              <form onSubmit={submit} className="grid gap-4 contact-form">
                <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                          {settings.contactNameLabel || "Full Name"}{" "}
                          <span className="text-red-300">*</span>
                        </label>
                        <input
                          id="contact-name"
                          required
                          className="input"
                          placeholder={
                            settings.contactNamePlaceholder || "Your full name"
                          }
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                          {settings.contactEmailFieldLabel || "Email Address"}{" "}
                          <span className="text-red-300">*</span>
                        </label>
                        <input
                          id="contact-email"
                          required
                          type="email"
                          className="input"
                          placeholder={
                            settings.contactEmailPlaceholder ||
                            "you@example.com"
                          }
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          maxLength={254}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                      >
                        {settings.contactPhoneFieldLabel || "Phone Number"}{" "}
                        <span className="text-red-300">*</span>
                      </label>
                      <InternationalPhoneField
                        value={form.phone}
                        onChange={(phone) =>
                          setForm((current) => ({ ...current, phone }))
                        }
                        country={phoneCountry}
                        onCountryChange={setPhoneCountry}
                        placeholder={
                          settings.contactPhonePlaceholder || "Phone number"
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-company"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                      >
                        {settings.contactCompanyLabel || "Business / Company"}
                      </label>
                      <input
                        id="contact-company"
                        className="input"
                        placeholder={
                          settings.contactCompanyPlaceholder ||
                          "Business or company name (optional)"
                        }
                        value={form.company}
                        onChange={(e) =>
                          setForm({ ...form, company: e.target.value })
                        }
                        maxLength={120}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-service"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                      >
                        {settings.contactServiceLabel ||
                          "Service Interested In"}
                      </label>
                      <select
                        id="contact-service"
                        className="input"
                        value={form.service}
                        onChange={(e) =>
                          setForm({ ...form, service: e.target.value })
                        }
                      >
                        <option value="">
                          {settings.contactServicePlaceholder ||
                            "Select a service"}
                        </option>
                        {serviceOptions.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-budget"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                      >
                        {settings.contactBudgetLabel || "Budget"}{" "}
                        <span className="text-slate-500">
                          ({settings.contactOptionalLabel || "Optional"})
                        </span>
                      </label>
                      <input
                        id="contact-budget"
                        className="input"
                        placeholder={
                          settings.contactBudgetPlaceholder ||
                          "Your estimated budget (optional)"
                        }
                        value={form.budget}
                        onChange={(e) =>
                          setForm({ ...form, budget: e.target.value })
                        }
                        maxLength={80}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                      >
                        {settings.contactMessageLabel || "Project Details"}{" "}
                        <span className="text-red-300">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={7}
                        className="input"
                        placeholder={
                          settings.contactMessagePlaceholder ||
                          "How can we help with your project?"
                        }
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        maxLength={5000}
                      />
                    </div>
                </>

                {status.error && (
                  <div className="text-red-300 text-sm">{status.error}</div>
                )}
                {status.ok && (
                  <div className="text-emerald-300 text-sm">{status.ok}</div>
                )}

                <button
                  type="submit"
                  className="primary w-full"
                  disabled={status.busy}
                >
                  {status.busy ? (
                    settings.contactSendingLabel || "Sending..."
                  ) : (
                    <>
                      {settings.contactSubmitLabel || "Send Message"}{" "}
                      <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
