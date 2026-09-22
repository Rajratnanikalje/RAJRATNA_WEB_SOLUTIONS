import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Code,
  Globe,
  Layout,
  Palette,
  Rocket,
  Shield,
  Smartphone,
  Star,
  Zap,
} from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

const techStack = [
  "React", "Node.js", "MongoDB", "Express", "Tailwind",
  "JavaScript", "TypeScript", "Cloudinary", "Git", "CSS3",
];

const metrics = [
  ["Projects", "delivered"],
  ["Services", "available"],
  ["Technologies", "in the stack"],
];

const whyChoose = [
  {
    icon: Rocket,
    title: "Modern Design",
    desc: "Clean, conversion-focused interfaces built with modern UX principles.",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    desc: "Optimised websites with fast load times and search-friendly foundations.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    desc: "Flawless experiences across desktop, tablet and mobile devices.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Built-in security best practices and dependable infrastructure.",
  },
  {
    icon: Layout,
    title: "Clean Code",
    desc: "Maintainable, well-structured code that scales with your business.",
  },
  {
    icon: Palette,
    title: "Pixel Perfect",
    desc: "Attention to detail in every element, from typography to spacing.",
  },
];

const steps = [
  {
    num: "01",
    title: "Strategy",
    desc: "We map your goals into a clear technical roadmap.",
  },
  {
    num: "02",
    title: "Design",
    desc: "High-fidelity designs that balance aesthetics and performance.",
  },
  {
    num: "03",
    title: "Develop",
    desc: "Clean, scalable code built with modern technologies.",
  },
  {
    num: "04",
    title: "Launch",
    desc: "Deployed, tested and optimised for real-world success.",
  },
];

const heroFeatures = [
  { icon: Code, title: "Web Development", sub: "Modern & Scalable" },
  { icon: Smartphone, title: "Responsive Design", sub: "All Devices" },
  { icon: Cloud, title: "API Integration", sub: "Seamless & Secure" },
  { icon: Rocket, title: "Ongoing Support", sub: "Always With You" },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [counts, setCounts] = useState({ projects: 0, services: 0, tech: 0 });
  const [settings, setSettings] = useState({});
  const [settingsError, setSettingsError] = useState("");
  const [loading, setLoading] = useState({ services: true, projects: true, tech: true });

  const loadHomeContent = useCallback((silent = false) => {
    if (!silent) {
      setLoading({ services: true, projects: true, tech: true });
    }
    pub
      .projects()
      .then((r) => {
        const d = r.data.data || [];
        setProjects(d);
        setCounts((c) => ({ ...c, projects: d.length }));
      })
      .finally(() => setLoading((l) => ({ ...l, projects: false })));

    pub
      .settings()
      .then((r) => {
        setSettings(r.data?.data || {});
        setSettingsError("");
      })
      .catch(() => setSettingsError("Some site content could not be loaded. Please refresh shortly."));

    pub
      .services()
      .then((r) => {
        const d = r.data.data || [];
        setServices(d);
        setCounts((c) => ({ ...c, services: d.length }));
      })
      .finally(() => setLoading((l) => ({ ...l, services: false })));

    pub
      .technologies()
      .then((r) => {
        const d = r.data.data || [];
        setTechnologies(d);
        setCounts((c) => ({ ...c, tech: d.length }));
      })
      .finally(() => setLoading((l) => ({ ...l, tech: false })));
  }, []);

  useEffect(() => {
    loadHomeContent();
    pub.view().catch(() => {});
  }, [loadHomeContent]);

  // Re-fetch silently when the admin saves new content (same tab, other
  // tab, or when this tab becomes visible again) — no manual refresh needed.
  useContentRefresh(() => loadHomeContent(true));

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-section relative min-h-screen flex flex-col overflow-hidden pt-28">
        {settingsError && <p className="sr-only" role="status">{settingsError}</p>}
        {/* Full-bleed background — upload via Admin → Settings → Hero Image */}
        <div className="hero-bg">
          {settings.heroImageUrl ? (
            <img
              src={settings.heroImageUrl}
              alt="Rajratna Web Solutions — modern workspace"
            />
          ) : (
            <div className="hero-bg-fallback" />
          )}
          <div className="hero-orb hero-orb--two" />
          <div className="hero-orb hero-orb--three" />
          <div className="hero-shade" />
        </div>

        {/* Handwritten accent — top right */}
        <div className="hero-script" aria-hidden="true">
          Design
          <br />
          Develop
          <br />
          Deploy
          <br />
          Grow
        </div>

        {/* Blue swoosh curves — bottom left */}
        <svg
          className="hero-swoosh hidden sm:block"
          viewBox="0 0 900 320"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="swooshA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0a3f8f" stopOpacity="0.95" />
              <stop offset="1" stopColor="#1f6feb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="swooshB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#78a9ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-60 290 C 210 150, 470 95, 950 30"
            stroke="url(#swooshA)"
            strokeWidth="90"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M-60 315 C 230 175, 490 125, 950 75"
            stroke="url(#swooshB)"
            strokeWidth="24"
            strokeLinecap="round"
          />
        </svg>

        {/* Main content — left */}
        <div className="container relative z-10 flex-1 flex items-center">
          <Reveal>
            <div className="max-w-2xl pb-10">
              <div className="hero-tagline">
                <span>Your Vision</span>
                <span className="hero-dot" />
                <span>Our Code</span>
                <span className="hero-dot" />
                <span>Digital Success</span>
              </div>

              <h1 className="hero-title-v2 mt-7">
                {settings.homeHeroTitle || <><span className="hero-silver">Rajratna</span><br /><span className="hero-blue">Web Solution</span></>}
              </h1>

              <p className="hero-sub mt-7">
                {settings.homeHeroSubtitle || "Build Your Ideas Into Powerful Digital Experiences"}
              </p>

              <p className="muted text-base md:text-lg leading-8 max-w-xl mt-4">
                We create modern websites, powerful web applications and
                digital solutions that help your business grow in the digital
                world.
              </p>

              <div className="mt-9">
                <Link to="/contact" className="hero-cta">
                  Let&rsquo;s Build Together
                  <span className="hero-cta-arrow">
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Feature strip — bottom */}
        <div className="container relative z-10 pb-12">
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8">
              {heroFeatures.map((f) => (
                <div className="hero-feature" key={f.title}>
                  <f.icon size={22} className="text-[#78a9ff]" />
                  <div className="mt-2.5 text-sm font-bold text-white">
                    {f.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{f.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="marquee">
        <div className="marquee-track">
          {techStack.map((text, i) => (
            <span className="marquee-item" key={i}>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ===== METRICS ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <Heading
              label="Results"
              title="Numbers that speak."
              desc="A track record built on real client outcomes."
            />
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            {metrics.map(([number, label], i) => (
              <Reveal key={label} delay={i * 0.06}>
                <Card className="metric-card p-7 md:p-9 min-h-44 text-center">
                  <div className="font-['Playfair_Display'] text-4xl font-bold text-gradient">
                    {number === "Projects"
                      ? counts.projects
                      : number === "Services"
                      ? counts.services
                      : counts.tech}
                  </div>
                  <p className="muted text-sm leading-6 mt-3">{label}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECHNOLOGY SHOWCASE ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <Heading
              label="Technology Stack"
              title="Tools I build with."
              desc="A modern toolkit, used with purpose."
            />
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-10">
            {(loading.tech ? techStack : technologies.map((t) => t.name)).map(
              (name, i) => (
                <Reveal key={name || i} delay={i * 0.02}>
                  <div
                    className="tech-card group"
                  >
                    <div className="tech-icon mx-auto mb-2 flex items-center justify-center">
                      <Code size={18} className="text-slate-900" />
                    </div>
                    <div className="tech-name text-sm font-medium group-hover:text-[#78a9ff] transition-colors">
                      {name}
                    </div>
                  </div>
                </Reveal>
              )
            )}
          </div>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="section pt-0">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
            <Reveal>
              <div>
                <div className="label">
                  <span className="eyebrow-line" />
                  About Rajratna
                </div>
                <h2 className="title">
                  Crafting websites that mean business.
                </h2>
                <p className="muted leading-8 mt-6">
                  I'm Rajratna Nikalje, a full-stack web developer building
                  responsive, secure and high-performing websites for clients
                  across India.
                </p>
                <div className="mt-8 space-y-3">
                  {steps.map((step) => (
                    <div key={step.num} className="flex gap-4">
                      <div className="text-[#78a9ff] font-mono font-bold">
                        {step.num}
                      </div>
                      <div>
                        <div className="font-semibold">{step.title}</div>
                        <p className="muted text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/about" className="secondary mt-8 inline-flex">
                  Learn more <ArrowUpRight size={15} />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                <Card className="stat-card p-6 text-center min-h-36">
                  <Star size={24} className="mx-auto text-[#78a9ff]" />
                  <div className="text-3xl font-bold text-gradient mt-2">
                    {counts.services}
                  </div>
                  <p className="muted text-xs mt-1">Service areas</p>
                </Card>
                <Card className="stat-card p-6 text-center min-h-36">
                  <Globe size={24} className="mx-auto text-[#78a9ff]" />
                  <div className="text-3xl font-bold text-gradient mt-2">
                    {counts.tech}
                  </div>
                  <p className="muted text-xs mt-1">Tech tools</p>
                </Card>
                <Card className="stat-card p-6 text-center min-h-36">
                  <Rocket size={24} className="mx-auto text-[#78a9ff]" />
                  <div className="text-3xl font-bold text-gradient mt-2">
                    {counts.projects}
                  </div>
                  <p className="muted text-xs mt-1">Projects built</p>
                </Card>
                <Card className="stat-card p-6 text-center min-h-36">
                  <Shield size={24} className="mx-auto text-[#78a9ff]" />
                  <div className="text-3xl font-bold text-gradient mt-2">
                    100%
                  </div>
                  <p className="muted text-xs mt-1">Client-focused</p>
                </Card>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <Heading
              label="Services"
              title="Web solutions for every stage of growth."
              desc="Choose a focused service or combine them into a custom build."
            />
          </Reveal>
          {loading.services && services.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} className="p-7 h-56">
                  <div className="h-6 w-3/4 bg-white/5 rounded mb-3" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="muted text-center py-12">No services available at the moment.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {services.map((s, i) => (
                <Reveal key={s._id || i} delay={i * 0.06}>
                  <Card className="service-card p-7 h-full group">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="w-full h-40 object-cover rounded-2xl border border-white/10 mb-6"
                      />
                    ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(120,169,255,.3)]">
                      <Code size={20} className="text-slate-900" />
                    </div>
                    )}
                    <div className="text-xs text-slate-500 font-mono">
                      0{i + 1}
                    </div>
                    <h3 className="text-xl font-bold mt-3 group-hover:text-[#78a9ff] transition-colors">
                      {s.title}
                    </h3>
                    <p className="muted text-sm leading-6 mt-3">
                      {s.description}
                    </p>
                    <ArrowUpRight
                      className="text-[#78a9ff] mt-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
                      size={18}
                    />
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/services" className="secondary">
              View all services <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <Heading
              label="Why Choose Us"
              title="What sets us apart."
              desc="Quality, speed and reliability baked into every project."
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {whyChoose.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  <Card className="p-7 h-full group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(120,169,255,.3)]">
                      <Icon size={20} className="text-slate-900" />
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-[#78a9ff] transition-colors">
                      {item.title}
                    </h3>
                    <p className="muted text-sm leading-6 mt-2">
                      {item.desc}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <Heading
              label="Portfolio"
              title="Selected builds."
              desc="Real projects built with modern frontend, backend and database technologies."
            />
          </Reveal>

          {loading.projects && projects.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="overflow-hidden">
                  <div className="h-56 bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-2">
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="muted text-center py-12">No projects to display yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {projects.slice(0, 6).map((p, i) => (
                <Reveal key={p._id || i} delay={i * 0.06}>
                  <Card className="portfolio-card group overflow-hidden h-full">
                    <div className="h-56 bg-gradient-to-br from-[#1a2a4a]/50 to-[#0a1429]/50 flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-6xl text-white/5 font-bold">
                          RWS
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[#78a9ff] text-xs font-mono">
                        {p.category || "Project"}
                      </div>
                      <h3 className="font-bold text-lg mt-2 line-clamp-2 group-hover:text-[#78a9ff] transition-colors">
                        {p.name}
                      </h3>
                      <p className="muted text-sm leading-6 mt-2 line-clamp-2">
                        {p.description}
                      </p>
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.technologies.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-5">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary text-xs w-full group-hover:border-[#78a9ff] transition-colors"
                        >
                          View Project <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/portfolio" className="secondary">
              View all projects <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <div className="cta-panel rounded-[30px] p-7 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
                <div>
                  <div className="label">Your next chapter</div>
                  <h2 className="font-['Playfair_Display'] text-[clamp(36px,5.5vw,64px)] leading-[.92] tracking-[-.04em] mt-4 max-w-2xl">
                    Good digital work starts with a good conversation.
                  </h2>
                  <p className="mt-4 text-sm opacity-80 max-w-lg">
                    Let's talk about your project and get a free, no-obligation
                    quote from Rajratna Web Solutions.
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="cta-arrow inline-flex items-center justify-center w-16 h-16 rounded-full hover:scale-110 transition-transform"
                  aria-label="Start a project"
                >
                  <ArrowUpRight size={27} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
