import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";
import { publicPath } from "../content/siteRoutes";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});

  const loadServices = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    pub
      .services()
      .then((r) => {
        const d = r.data.data || [];
        setServices(d);
        setError("");
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Could not load services. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadServices();
    pub.settings().then((r) => setSettings(r.data?.data || {})).catch(() => {});
  }, [loadServices]);

  useContentRefresh(() => { loadServices(true); pub.settings().then((r) => setSettings(r.data?.data || {})).catch(() => {}); });

  if (settings.servicesPageVisible === false) return null;

  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label={settings.servicesPageEyebrow || "Services"}
            title={settings.servicesPageTitle || "Web solutions for every stage of growth."}
            desc={settings.servicesPageDescription || "Choose a focused service or combine them into a custom build."}
          />
        </Reveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[1, 2, 3, 4, 5].map((n) => (
              <Card key={n} className="p-7 h-52">
                <div className="h-6 w-3/4 bg-white/5 rounded mb-3" />
                <div className="h-4 w-full bg-white/5 rounded mb-2" />
                <div className="h-4 w-5/6 bg-white/5 rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {services.map((s, i) => (
              <Reveal key={s._id || i} delay={i * 0.06}>
                <Card className="service-card p-7 h-full group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center overflow-hidden mb-6 shadow-[0_0_25px_rgba(120,169,255,.25)]">
                    {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" /> : <Code size={22} className="text-slate-900" />}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mb-2">
                    0{i + 1}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-[#78a9ff] transition-colors">
                    {s.title}
                  </h3>
                  <p className="muted mt-3 leading-7">{s.description}</p>
                  <Link
                    to={publicPath(settings.serviceCardCtaRouteKey || "contact", "/contact")}
                    className="secondary mt-6 text-sm group-hover:border-[#78a9ff] transition-colors"
                  >
                    {settings.serviceCardCtaText || "Enquire now"} <ArrowUpRight size={14} />
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        {error && <p className="text-red-300 text-sm mt-6">{error}</p>}
        {!loading && !error && services.length === 0 && (
          <p className="muted text-center py-12">No services available at the moment.</p>
        )}

        <div className="text-center mt-14">
          <Link to={publicPath(settings.servicesCtaRouteKey || "contact", "/contact")} className="primary">
            {settings.servicesCtaText || "Get a Free Quote"} <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
