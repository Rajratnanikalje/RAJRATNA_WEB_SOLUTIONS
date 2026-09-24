import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Braces, Code2, Database, Github, Layers3,
  MessageCircle, MonitorSmartphone, ShieldCheck, Zap,
} from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";
import ProcessSection from "../components/ProcessSection";
import { publicPath, routeKeyFromPath } from "../content/siteRoutes";
import { withWhatsAppMessage } from "../utils/whatsapp";

const reasons = [
  [Layers3, "Custom-Built Solutions", "Features and interfaces shaped around the project requirements."],
  [Code2, "Modern Technology", "Current frontend and backend tools chosen to suit the work."],
  [MonitorSmartphone, "Responsive Design", "Layouts designed to work across phones, tablets and larger screens."],
  [Braces, "Clean Architecture", "Organised components and code that are easier to maintain."],
  [ShieldCheck, "Secure Development", "Validation and established security practices built into delivery."],
  [Zap, "Performance Focused", "Lean pages and considered assets for a smoother experience."],
  [Database, "Scalable Solutions", "A foundation that can grow with features and content needs."],
  [MessageCircle, "Post-Launch Support", "Help with launch follow-up and ongoing website improvements."],
];

const faqs = [
  ["What type of websites do you build?", "Business websites, portfolios, e-commerce experiences and custom web applications."],
  ["Do you build full-stack applications?", "Yes. Projects can include a React frontend, backend APIs and database integration."],
  ["Can you create e-commerce websites?", "Yes. E-commerce features can be planned around the products and shopping flow you need."],
  ["Can you build custom admin dashboards?", "Yes. Custom dashboards and content management tools can be built for project workflows."],
  ["Do you provide website maintenance?", "Maintenance and follow-up support can be discussed based on your website and needs."],
  ["Can you integrate APIs and third-party services?", "Yes. API and service integrations can be included when they fit the project requirements."],
  ["Do you provide deployment and hosting support?", "Deployment and hosting setup support are available for web projects."],
];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [cmsServices, setCmsServices] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [settings, setSettings] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadContent = useCallback(() => {
    Promise.allSettled([pub.services(), pub.projects(), pub.technologies(), pub.settings()]).then(([serviceResult, projectResult, technologyResult, settingsResult]) => {
      if (serviceResult.status === "fulfilled") setCmsServices(serviceResult.value.data?.data || []);
      if (projectResult.status === "fulfilled") setProjects(projectResult.value.data?.data || []);
      else setLoadError("Some site content could not be loaded. Please try again shortly.");
      if (technologyResult.status === "fulfilled") setTechnologies(technologyResult.value.data?.data || []);
      if (settingsResult.status === "fulfilled") setSettings(settingsResult.value.data?.data || {});
      setLoadingProjects(false);
    });
  }, []);

  useEffect(() => {
    loadContent();
    pub.view().catch(() => {});
  }, [loadContent]);

  useContentRefresh(loadContent);

  const whatsappPhone = (settings.phone || "").replace(/\D/g, "");
  const whatsappHref = withWhatsAppMessage(whatsappPhone);
  const featuredProjects = projects.filter((project) => project.featured);
  const homeProjects = featuredProjects.length ? featuredProjects : projects;
  const activeTestimonials = (settings.testimonials || []).filter((item) => item.active !== false);
  const featuredTestimonials = activeTestimonials.filter((item) => item.featured);
  const homeTestimonials = featuredTestimonials.length ? featuredTestimonials : activeTestimonials;
  const legacyHeroLines = typeof settings.homeHeroTitle === "string"
    ? settings.homeHeroTitle.replace(/\\n/g, "\n").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
  const heroMainTitle = legacyHeroLines.length > 1 ? legacyHeroLines[0] : settings.homeHeroTitle || "RAJRATNA .";
  const heroSecondTitle = settings.homeHeroSecondaryTitle || legacyHeroLines[1] || "WEB";
  const heroThirdTitle = settings.homeHeroThirdTitle || legacyHeroLines[2] || "SOLUTION";
  const heroWords = (settings.homeHeroVerticalWords || ["Design", "Develop", "Deploy", "Grow"].map((label) => ({ label, visible: true }))).filter((item) => item.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <>
      {settings.heroVisible !== false && <section className="hero-section relative min-h-[min(100svh,820px)] flex items-center overflow-hidden pt-20 sm:pt-24">
        <div className="hero-bg" aria-hidden="true">
          {settings.heroImageUrl ? <img src={settings.heroImageUrl} alt="" fetchPriority="high" /> : <div className="hero-bg-fallback" />}
          <div className="hero-orb hero-orb--two" /><div className="hero-orb hero-orb--three" /><div className="hero-shade" />
        </div>

        {settings.homeHeroVerticalVisible !== false && <div className="hero-script" aria-hidden="true">{heroWords.map((item) => <span key={item.label} className="block">{item.label}</span>)}</div>}

        <svg className="hero-swoosh hidden sm:block" viewBox="0 0 900 320" fill="none" preserveAspectRatio="none" aria-hidden="true">
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
          <path d="M-60 290 C 210 150, 470 95, 950 30" stroke="url(#swooshA)" strokeWidth="90" strokeLinecap="round" opacity="0.5" />
          <path d="M-60 315 C 230 175, 490 125, 950 75" stroke="url(#swooshB)" strokeWidth="24" strokeLinecap="round" />
        </svg>

        <div className="container relative z-10 py-8 sm:py-10 lg:py-12">
          <Reveal>
            <div className="hero-copy max-w-2xl">
              <p className="hero-tagline">{(settings.homeHeroEyebrow || "YOUR VISION • OUR CODE • DIGITAL SUCCESS").split("•").map((part, index, parts) => <span key={`${part}-${index}`} className="inline-flex items-center gap-3">{part.trim()}{index < parts.length - 1 && <span className="hero-dot"/>}</span>)}</p>
              <h1 className="hero-title-v2 mt-5 md:mt-6">
                <span className="hero-silver">{heroMainTitle}</span><br />
                <span className="hero-blue">{heroSecondTitle}</span><br />
                <span className="hero-blue">{heroThirdTitle}</span>
              </h1>
              <p className="hero-sub mt-5 md:mt-6">
                {settings.homeHeroSubtitle || "Build Your Ideas Into Powerful Digital Experiences"}
              </p>
              <p className="muted text-base md:text-lg leading-7 max-w-xl mt-4">
                {settings.homeHeroDescription || "We create modern websites, powerful web applications and digital solutions that help your business grow in the digital world."}
              </p>
              {settings.heroCtaVisible !== false && <div className="mt-6">
                {/^(https?:\/\/)/i.test(settings.homeHeroCtaUrl || "") && !settings.homeHeroCtaRouteKey ? <a href={settings.homeHeroCtaUrl} target="_blank" rel="noreferrer" className="hero-cta">{settings.homeHeroCtaText || "Let's Build Together"}<span className="hero-cta-arrow"><ArrowRight size={16} strokeWidth={2.4} /></span></a> : <Link to={publicPath(settings.homeHeroCtaRouteKey || routeKeyFromPath(settings.homeHeroCtaUrl || "/contact"), "/contact")} className="hero-cta">{settings.homeHeroCtaText || "Let's Build Together"}<span className="hero-cta-arrow"><ArrowRight size={16} strokeWidth={2.4} /></span></Link>}
              </div>}
            </div>
          </Reveal>
        </div>
      </section>}

      {settings.aboutVisible !== false && <section id="about" className="section pt-0 scroll-mt-24">
        <div className="container"><Reveal><Card className="p-8 md:p-12 lg:p-16"><div className="max-w-3xl"><div className="label">{settings.homeAboutEyebrow || "About RWS"}</div><h2 className="title">{settings.homeAboutTitle || settings.aboutTitle || "Building Digital Experiences That Matter."}</h2><p className="muted text-base md:text-lg leading-8 mt-6">{settings.homeAboutDescription || settings.aboutDescription || "Rajratna Web Solutions is a modern web development studio focused on creating responsive websites, full-stack applications and digital solutions for businesses and ideas."}</p><Link to={publicPath(settings.homeAboutCtaRouteKey || "about", "/about")} className="secondary mt-7">{settings.homeAboutCtaText || "More about RWS"} <ArrowUpRight size={15} /></Link></div></Card></Reveal></div>
      </section>}

      {settings.servicesVisible !== false && <section id="services" className="section scroll-mt-24">
        <div className="container">
          <Reveal><Heading label={settings.homeServicesEyebrow || "Services"} title={settings.homeServicesTitle || "What We Build"} desc={settings.homeServicesDescription || "Digital solutions designed around your business goals."} /></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {cmsServices.map(({ title, description, imageUrl }, index) => {
              const Icon = Code2;
              return (
              <Reveal key={title} delay={index * 0.035}><Card className="p-6 h-full group">
                {imageUrl ? <img src={imageUrl} alt={title} loading="lazy" className="w-11 h-11 rounded-xl object-cover mb-5" /> : <div className="w-11 h-11 rounded-xl bg-[#78a9ff]/10 border border-[#78a9ff]/20 flex items-center justify-center mb-5"><Icon size={20} className="text-[#78a9ff]" /></div>}
                <h3 className="font-bold text-lg group-hover:text-[#78a9ff] transition-colors">{title}</h3>
                <p className="muted text-sm leading-6 mt-2">{description}</p>
              </Card></Reveal>
              );
            })}
            {!cmsServices.length && <p className="muted col-span-full text-center py-8">No services are currently available.</p>}
          </div>
          <div className="text-center mt-10"><Link to={publicPath(settings.homeServicesCtaRouteKey || "services", "/services")} className="secondary">{settings.homeServicesCtaText || "Explore services"} <ArrowUpRight size={15}/></Link></div>
        </div>
      </section>}

      {settings.projectsVisible !== false && <section id="projects" className="section pt-0 scroll-mt-24">
        <div className="container">
          <Reveal><Heading label={settings.homeProjectsEyebrow || "Portfolio"} title={settings.homeProjectsTitle || "Featured Projects"} desc={settings.homeProjectsDescription || "Real products and digital experiences built with modern technologies."} /></Reveal>
          {loadingProjects ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12" aria-label="Loading projects">{[1, 2, 3].map((n) => <Card key={n} className="h-72 animate-pulse bg-white/5" />)}</div> : homeProjects.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {homeProjects.slice(0, 6).map((project, index) => <Reveal key={project._id || project.name} delay={index * 0.05}><Card className="portfolio-card group overflow-hidden h-full">
                <div className="h-52 bg-gradient-to-br from-[#1a2a4a]/70 to-[#0a1429]/80 overflow-hidden">
                  {project.imageUrl ? <img src={project.imageUrl} alt={`${project.name} project preview`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-6xl font-bold text-white/10">RWS</span></div>}
                </div>
                <div className="p-6 flex flex-col h-[calc(100%-13rem)]">
                  <span className="text-[#78a9ff] text-xs font-mono">{project.category || "Project"}</span>
                  <h3 className="font-bold text-xl mt-2">{project.name}</h3>
                  {project.title && <p className="muted text-sm mt-1">{project.title}</p>}
                  <p className="muted text-sm leading-6 mt-3">{project.description}</p>
                  {project.fullDescription && <details className="mt-3"><summary className="cursor-pointer text-xs text-[#78a9ff]">{settings.projectDetailsLabel || "More project details"}</summary><p className="muted text-sm leading-6 mt-2 whitespace-pre-line">{project.fullDescription}</p></details>}
                  {!!project.technologies?.length && <div className="flex flex-wrap gap-1.5 mt-4">{project.technologies.slice(0, 5).map((technology) => <span key={technology} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{technology}</span>)}</div>}
                  <div className="flex flex-wrap gap-2 mt-auto pt-5">{project.url && <a href={project.url} target="_blank" rel="noreferrer" className="secondary text-xs">{settings.projectDemoLabel || "View Project"} <ArrowUpRight size={13} /></a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" aria-label={`${project.name} GitHub repository`} className="secondary text-xs"><Github size={13}/> {settings.projectGithubLabel || "GitHub"}</a>}</div>
                </div>
              </Card></Reveal>)}
            </div>
          ) : <p className="muted text-center py-12 mt-4">Projects will appear here as they are added to the portfolio.</p>}
          {loadError && <p className="text-amber-300 text-sm mt-5" role="status">{loadError}</p>}
          <div className="text-center mt-10"><Link to={publicPath(settings.homeProjectsCtaRouteKey || "projects", "/portfolio")} className="secondary">{settings.homeProjectsCtaText || "Explore all projects"} <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>}

      {settings.technologiesVisible !== false && <section id="technologies" className="section pt-0">
        <div className="container"><Reveal><Heading label={settings.homeTechnologiesEyebrow || "Technology"} title={settings.homeTechnologiesTitle || "Technologies We Use"} desc={settings.homeTechnologiesDescription || "A practical stack selected to fit the needs of each project."} /></Reveal>
          {technologies.length ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-10">{technologies.map((tech, index) => <Reveal key={tech._id || tech.name} delay={index * 0.02}><div className="tech-card group min-h-24 flex flex-col items-center justify-center gap-2">{tech.iconUrl ? <img src={tech.iconUrl} alt="" loading="lazy" className="w-7 h-7 object-contain" /> : <Code2 size={20} className="text-[#78a9ff]" />}<span className="tech-name text-sm">{tech.name}</span></div></Reveal>)}</div> : <p className="muted mt-8">Technology details are being updated.</p>}
        </div>
      </section>}

      {settings.whyVisible !== false && <section className="section pt-0">
        <div className="container"><Reveal><Heading label={settings.homeWhyEyebrow || "Why RWS"} title={settings.whyTitle || "Why Choose Rajratna Web Solutions?"} desc={settings.whyDescription || "A thoughtful approach to building and supporting your digital product."} /></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">{(settings.whyItems || reasons.map(([icon, title, description], displayOrder) => ({ icon: icon.displayName, title, description, displayOrder, active: true }))).filter((item) => item.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((item, index) => { const iconByTitle = { "Custom-Built Solutions": Layers3, "Modern Technology": Code2, "Responsive Design": MonitorSmartphone, "Clean Architecture": Braces, "Secure Development": ShieldCheck, "Performance Focused": Zap, "Scalable Solutions": Database, "Post-Launch Support": MessageCircle }; const iconByKey = { Layers3, Code2, MonitorSmartphone, Braces, ShieldCheck, Zap, Database, MessageCircle }; const Icon = iconByKey[item.iconKey] || iconByTitle[item.title] || Code2; return <Reveal key={item.title} delay={index * 0.035}><Card className="p-6 h-full"><Icon size={22} className="text-[#78a9ff] mb-4" /><h3 className="font-bold">{item.title}</h3><p className="muted text-sm leading-6 mt-2">{item.description}</p></Card></Reveal>; })}</div>
        </div>
      </section>}

      {settings.processVisible !== false && <ProcessSection settings={settings} />}

      {settings.faqVisible !== false && <section className="section pt-0">
        <div className="container"><Reveal><Heading label={settings.homeFaqEyebrow || "FAQ"} title={settings.homeFaqTitle || "A Few Common Questions"} desc={settings.homeFaqDescription || "Some details that help make the first conversation easier."} /></Reveal>
          <div className="grid md:grid-cols-2 gap-3 mt-10">{(settings.faqItems || faqs.map(([question, answer], displayOrder) => ({ question, answer, displayOrder, active: true }))).filter((item) => item.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((item, index) => <Reveal key={item.question} delay={index * 0.025}><details className="glass rounded-2xl p-5 group"><summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78a9ff]">{item.question}<span className="text-[#78a9ff] group-open:rotate-45 transition-transform" aria-hidden="true">+</span></summary><p className="muted text-sm leading-6 mt-4">{item.answer}</p></details></Reveal>)}</div>
        </div>
      </section>}

      {settings.testimonialsVisible !== false && homeTestimonials.length > 0 && <section className="section pt-0"><div className="container"><Reveal><Heading label={settings.homeTestimonialsEyebrow || "Testimonials"} title={settings.homeTestimonialsTitle || "Client Feedback"} desc={settings.homeTestimonialsDescription || "Experiences shared by clients."} /></Reveal><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{homeTestimonials.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((item, index) => <Reveal key={`${item.clientName}-${index}`}><Card className="p-6 h-full">{item.profileImageUrl && <img src={item.profileImageUrl} alt="" loading="lazy" className="w-12 h-12 rounded-full object-cover mb-4"/>}<p className="muted text-sm leading-6">“{item.testimonial}”</p><p className="font-semibold mt-4">{item.clientName}</p>{item.company && <p className="muted text-xs mt-1">{item.company}</p>}</Card></Reveal>)}</div></div></section>}

      {settings.finalCtaVisible !== false && <section className="section pt-0">
        <div className="container"><Reveal><div className="cta-panel rounded-[30px] p-8 sm:p-12 lg:p-16"><div className="max-w-3xl"><div className="label">{settings.finalCtaEyebrow || "A good place to start"}</div><h2 className="font-['Playfair_Display'] text-[clamp(36px,5.5vw,64px)] leading-[.98] tracking-[-.04em] mt-4">{settings.finalCtaTitle || "Let's Build Something Great Together."}</h2><p className="mt-4 text-sm sm:text-base opacity-80">{settings.finalCtaDescription || "Explore the project approach, or tell us a little about what you have in mind."}</p><div className="flex flex-wrap gap-3 mt-7"><Link to={publicPath(settings.finalCtaButtonRouteKey || "contact", "/contact")} className="primary">{settings.finalCtaButtonText || "Have a Project in Mind?"} <ArrowRight size={15} /></Link>{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="secondary"><MessageCircle size={15} /> {settings.finalCtaWhatsappText || "WhatsApp Us"}</a>}</div></div></div></Reveal></div>
      </section>}
    </>
  );
}
