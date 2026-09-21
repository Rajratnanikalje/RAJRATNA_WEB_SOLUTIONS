import { useCallback, useEffect, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

const initialState = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialState);
  const [settings, setSettings] = useState({});
  const [status, setStatus] = useState({ busy: false, error: "", ok: "" });

  const loadContactSettings = useCallback(() => {
    pub.settings().then((r) => setSettings(r.data.data || {})).catch(() => {});
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
      await pub.enquiry(form);
      window.dispatchEvent(new Event("rws:new-enquiry"));
      setForm(initialState);
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
      value: settings.email || "rajratnaofficial7252@gmail.com",
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
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    Phone
                  </label>
                  <input
                    className="input"
                    placeholder="+91 91 56914227"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    maxLength={30}
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
