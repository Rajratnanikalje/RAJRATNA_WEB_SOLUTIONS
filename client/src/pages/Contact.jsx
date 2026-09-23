import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import {
  defaultCountries,
  parseCountry,
  PhoneInput,
} from "react-international-phone";
import "react-international-phone/style.css";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

const initialState = { name: "", email: "", phone: "", message: "" };
const countries = defaultCountries.map(parseCountry);
const india = countries.find((country) => country.iso2 === "in");

const countryFlag = (iso2) =>
  iso2
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");

function InternationalPhoneField({ value, onChange, country, onCountryChange }) {
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
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
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
          <span className="contact-country-chevron" aria-hidden="true">⌄</span>
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
            <div className="contact-country-results" role="listbox" aria-label="Countries">
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
                    <span className="contact-country-flag" aria-hidden="true">{countryFlag(item.iso2)}</span>
                    <span className="contact-country-name">{item.name}</span>
                    <span className="contact-country-option-code">+{item.dialCode}</span>
                  </button>
                ))
              ) : (
                <p className="contact-country-empty" role="status">No countries found.</p>
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
        countrySelectorStyleProps={{ className: "contact-phone-library-selector" }}
        inputClassName="contact-phone-number-input"
        inputProps={{
          id: "contact-phone",
          "aria-label": "Phone number",
          autoComplete: "tel",
          maxLength: 30,
        }}
        placeholder="Phone number"
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

  const loadContactSettings = useCallback(() => {
    pub.settings()
      .then((r) => {
        setSettings(r.data.data || {});
        setSettingsError("");
      })
      .catch(() => setSettingsError("Contact details are temporarily unavailable; you can still send an enquiry."));
  }, []);

  useEffect(() => {
    loadContactSettings();
  }, [loadContactSettings]);

  useContentRefresh(loadContactSettings);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address.";
    const phoneDigits = form.phone.replace(/\D/g, "");
    const hasPhoneNumber = phoneDigits && phoneDigits !== phoneCountry.dialCode;
    if (hasPhoneNumber && !/^\+[1-9]\d{6,14}$/.test(form.phone)) {
      return "Please enter a valid international phone number.";
    }
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
      const phoneDigits = form.phone.replace(/\D/g, "");
      await pub.enquiry({
        ...form,
        phone: phoneDigits === phoneCountry.dialCode ? "" : form.phone,
      });
      window.dispatchEvent(new Event("rws:new-enquiry"));
      setForm(initialState);
      setPhoneCountry(india);
      setStatus({ busy: false, error: "", ok: "Your enquiry has been received. We'll get back to you soon." });
    } catch (x) {
      setStatus({
        busy: false,
        error: x.response?.data?.message || "Unable to send enquiry. Please try again.",
        ok: "",
      });
    }
  };

  const contacts = [
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone || "+91 9156914227",
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email || "rajratnawebsolutions@gmail.com",
    },
    {
      icon: MapPin,
      label: "Location",
      value: settings.location || "Buldhana, Maharashtra, India",
    },
  ];

  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label="CONTACT"
            title="Let's Build Something Great"
            desc="Tell us what you want to build. Enquiries are stored in MongoDB through the backend API."
          />
        </Reveal>
        {settingsError && <p className="text-amber-300 text-sm mt-4" role="status">{settingsError}</p>}

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 mt-12">
          <Reveal>
            <div className="space-y-5">
              <Card className="p-7 space-y-6">
                {contacts.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-slate-900" />
                      </div>
                      <div>
                        <b className="block text-sm text-slate-400">
                          {c.label}
                        </b>
                        <span className="muted text-sm mt-1 break-words">
                          {c.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <Card className="p-7">
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Name
                    </label>
                    <input
                      required
                      className="input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      maxLength={254}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-phone" className="text-xs font-medium text-slate-400 mb-1 block">
                    Phone
                  </label>
                  <InternationalPhoneField
                    value={form.phone}
                    onChange={(phone) => setForm((current) => ({ ...current, phone }))}
                    country={phoneCountry}
                    onCountryChange={setPhoneCountry}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={7}
                    className="input"
                    placeholder="How can we help with your project?"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    maxLength={5000}
                  />
                </div>

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
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send size={15} />
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
