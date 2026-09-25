import { useCallback, useEffect, useState } from "react";
import {
  Code2,
  Database,
  Layout,
  Shield,
  Smartphone,
  Zap,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";
import { publicPath } from "../content/siteRoutes";

const features = [
  {
    icon: Layout,
    title: "Responsive Design",
    desc: "Mobile-first interfaces that look flawless on every device.",
  },
  {
    icon: Smartphone,
    title: "Modern Web Applications",
    desc: "Built with React, Node.js and REST APIs for performance.",
  },
  {
    icon: Database,
    title: "Database Integration",
    desc: "MongoDB & Mongoose schemas designed for scale.",
  },
  {
    icon: Code2,
    title: "Full Stack Development",
    desc: "End-to-end development from concept through deployment.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "JWT auth, input validation and security best practices.",
  },
  {
    icon: Zap,
    title: "Performance Optimised",
    desc: "Lightning-fast websites with clean, efficient code.",
  },
];
const featureIcons = { Layout, Smartphone, Database, Code2, Shield, Zap };

export default function About() {
  const [aboutImageUrl, setAboutImageUrl] = useState("");
  const [content, setContent] = useState({});
  const [cmsTechnologies, setCmsTechnologies] = useState([]);

  const loadAboutImage = useCallback(() => {
    Promise.allSettled([pub.settings(), pub.technologies()]).then(
      ([settingsResult, technologiesResult]) => {
        if (settingsResult.status === "fulfilled") {
          const data = settingsResult.value.data?.data || {};
          setAboutImageUrl(data.aboutImageUrl || "");
          setContent(data);
        }
        if (technologiesResult.status === "fulfilled")
          setCmsTechnologies(technologiesResult.value.data?.data || []);
      },
    );
  }, []);

  useEffect(() => {
    loadAboutImage();
  }, [loadAboutImage]);

  useContentRefresh(loadAboutImage);

  if (content.aboutPageVisible === false) return null;
  const highlights = (
    content.aboutHighlights ||
    features.map(({ title, desc }, displayOrder) => ({
      title,
      description: desc,
      displayOrder,
      active: true,
    }))
  )
    .filter((item) => item.active !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const displayedTechStack = cmsTechnologies.map(
    ({ name, category, iconUrl }) => ({ name, category, iconUrl }),
  );

  return (
    <section className="section pt-40 relative overflow-hidden">
      {aboutImageUrl && (
        <div className="absolute inset-0">
          <img
            src={aboutImageUrl}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040711]/95 via-[#040711]/85 to-[#040711]/55" />
        </div>
      )}
      <div className="container relative z-10">
        <Reveal>
          <div className="max-w-3xl">
            <div>
              <div className="label">
                <span className="eyebrow-line" />
                {content.aboutEyebrow || "About Rajratna Web Solutions"}
              </div>
              <h1 className="title">
                {content.aboutTitle || (
                  <>Building Digital Experiences That Matter.</>
                )}
              </h1>
              <p className="muted leading-8 mt-6 text-lg max-w-xl">
                {content.aboutDescription || (
                  <>
                    Rajratna Web Solutions is a modern web development studio
                    focused on creating responsive websites, full-stack
                    applications and digital solutions for businesses and ideas.
                  </>
                )}
              </p>

              <div className="mt-8 space-y-3">
                {highlights.map((f, i) => {
                  const Icon =
                    featureIcons[f.iconKey] ||
                    features[i % features.length].icon;
                  return (
                    <div key={f.title} className="flex gap-4">
                      <div className="text-[#78a9ff] font-mono font-bold">
                        0{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#78a9ff]" />
                          <span className="font-semibold">{f.title}</span>
                        </div>
                        <p className="muted text-sm mt-0.5">
                          {f.description || f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <Link
                  to={publicPath(
                    content.aboutPrimaryCtaRouteKey || "contact",
                    "/contact",
                  )}
                  className="primary"
                >
                  {content.aboutPrimaryCtaText || "Get a Free Quote"}
                </Link>
                <Link
                  to={publicPath(
                    content.aboutSecondaryCtaRouteKey || "projects",
                    "/portfolio",
                  )}
                  className="secondary"
                >
                  {content.aboutSecondaryCtaText || "View Our Work"}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {content.aboutTechVisible !== false && (
          <Reveal delay={0.3}>
            <div className="mt-20">
              <Heading
                label={content.aboutTechEyebrow || "Tech Stack"}
                title={content.aboutTechTitle || "The tools I build with."}
                desc={
                  content.aboutTechDescription ||
                  "A modern toolkit, used with purpose."
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                {displayedTechStack.map((t, i) => (
                  <Reveal key={t.name} delay={i * 0.04}>
                    <Card className="tech-card group p-6 text-center h-full">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(120,169,255,.3)]">
                        {t.iconUrl ? (
                          <img
                            src={t.iconUrl}
                            alt={t.name}
                            loading="lazy"
                            className="w-9 h-9 object-contain"
                          />
                        ) : (
                          <Globe size={22} className="text-slate-900" />
                        )}
                      </div>
                      <div className="tech-name">{t.name}</div>
                      <div className="tech-category">{t.category}</div>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
