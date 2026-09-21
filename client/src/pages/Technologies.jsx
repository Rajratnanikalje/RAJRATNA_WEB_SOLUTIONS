import { useCallback, useEffect, useState } from "react";
import { Code, Cpu, Database, Globe, Server, Zap } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

const categoryIcons = {
  Frontend: <Code size={16} />,
  Backend: <Server size={16} />,
  Database: <Database size={16} />,
  Markup: <Globe size={16} />,
  Styling: <Cpu size={16} />,
  Language: <Zap size={16} />,
};

export default function Technologies() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTechs = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    pub
      .technologies()
      .then((r) => {
        const d = r.data.data || [];
        setTechs(d);
        setError("");
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Could not load technologies. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTechs();
  }, [loadTechs]);

  useContentRefresh(() => loadTechs(true));

  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label="Technologies"
            title="A modern stack, used with purpose."
            desc="Frontend, backend, database and product engineering tools."
          />
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Card key={n} className="p-6 text-center h-36">
                <div className="w-12 h-12 rounded-xl bg-white/5 mx-auto mb-3 animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded mx-auto" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {techs.map((t, i) => (
              <Reveal key={t._id || i} delay={i * 0.02}>
                <Card className="tech-card group p-7 h-full">
                  {t.iconUrl ? (
                    <img
                      src={t.iconUrl}
                      alt={t.name}
                      className="w-14 h-14 mx-auto mb-3 rounded-xl object-contain"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(120,169,255,.3)]">
                      {categoryIcons[t.category] || <Code size={24} className="text-slate-900" />}
                    </div>
                  )}
                  <div className="tech-name group-hover:text-[#78a9ff] transition-colors">
                    {t.name}
                  </div>
                  {t.category && (
                    <div className="tech-category">{t.category}</div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        {error && <p className="text-red-300 text-sm mt-6">{error}</p>}
      </div>
    </section>
  );
}
