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

const technologyBrandIcons = {
  html5: "html5/html5-original.svg",
  css3: "css3/css3-original.svg",
  javascript: "javascript/javascript-original.svg",
  react: "react/react-original.svg",
  reactjs: "react/react-original.svg",
  nodejs: "nodejs/nodejs-original.svg",
  express: "express/express-original.svg",
  expressjs: "express/express-original.svg",
  mongodb: "mongodb/mongodb-original.svg",
  git: "git/git-original.svg",
  github: "github/github-original.svg",
  tailwindcss: "tailwindcss/tailwindcss-original.svg",
  reduxtoolkit: "redux/redux-original.svg",
  mui: "materialui/materialui-original.svg",
  materialui: "materialui/materialui-original.svg",
};

const technologyBrandIcon = (name = "") => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const iconPath = technologyBrandIcons[key];
  return iconPath
    ? `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${iconPath}`
    : "";
};

export default function Technologies() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});

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
        setError(
          e.response?.data?.message ||
            "Could not load technologies. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTechs();
    pub
      .settings()
      .then((r) => setSettings(r.data?.data || {}))
      .catch(() => {});
  }, [loadTechs]);

  useContentRefresh(() => {
    loadTechs(true);
    pub
      .settings()
      .then((r) => setSettings(r.data?.data || {}))
      .catch(() => {});
  });

  if (settings.technologiesPageVisible === false) return null;

  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label={settings.technologiesPageEyebrow || "Technologies"}
            title={
              settings.technologiesPageTitle ||
              "A modern stack, used with purpose."
            }
            desc={
              settings.technologiesPageDescription ||
              "Frontend, backend, database and product engineering tools."
            }
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
            {techs.map((t, i) => {
              const brandIcon = !t.iconUrl && technologyBrandIcon(t.name);
              const monochromeBrand = ["express", "express.js", "github"]
                .includes(t.name.toLowerCase());

              return (
                <Reveal key={t._id || i} delay={i * 0.02}>
                  <Card className="tech-card group p-7 h-full">
                    {t.iconUrl || brandIcon ? (
                      <div className="technology-logo-3d">
                        <img
                          src={t.iconUrl || brandIcon}
                          alt={`${t.name} logo`}
                          loading="lazy"
                          decoding="async"
                          className="technology-logo-image w-10 h-10 object-contain"
                          style={
                            !t.iconUrl && monochromeBrand
                              ? { filter: "brightness(0) invert(1)" }
                              : undefined
                          }
                        />
                      </div>
                    ) : (
                      <div className="technology-logo-3d technology-icon w-14 h-14 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(120,169,255,.3)]" data-category={t.category || "default"}>
                        {categoryIcons[t.category] || (
                          <Code size={24} className="text-slate-900" />
                        )}
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
              );
            })}
          </div>
        )}

        {error && <p className="text-red-300 text-sm mt-6">{error}</p>}
      </div>
    </section>
  );
}
