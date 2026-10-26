import { useCallback, useEffect, useState } from "react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";
import TechnologyLogo from "../components/TechnologyLogo";
import { technologies } from "../data/technologies";

export default function Technologies() {
  const [settings, setSettings] = useState({});

  const loadSettings = useCallback(() => {
    pub.settings().then((r) => setSettings(r.data?.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useContentRefresh(() => {
    loadSettings();
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
          {technologies.map((technology, index) => (
            <Reveal key={technology.name} delay={index * 0.02}>
              <Card className="tech-card group p-7 h-full">
                <div className="technology-logo-3d technology-icon w-14 h-14 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mx-auto mb-3">
                  <TechnologyLogo
                    technology={technology}
                    alt={`${technology.name} logo`}
                    className="technology-logo-image w-10 h-10 object-contain text-slate-900"
                  />
                </div>
                <div className="tech-name group-hover:text-[#78a9ff] transition-colors">
                  {technology.name}
                </div>
                <div className="tech-category">{technology.category}</div>
              </Card>
            </Reveal>
          ))}
          </div>
      </div>
    </section>
  );
}
