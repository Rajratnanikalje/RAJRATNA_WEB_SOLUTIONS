import { lazy, Suspense, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Technologies from "./pages/Technologies";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import Process from "./pages/Process";
import { pub } from "./services/api";
import useContentRefresh from "./hooks/useContentRefresh";
import { routeKeyFromPath } from "./content/siteRoutes";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CMS = lazy(() => import("./pages/admin/CMS"));
const ContentEditor = lazy(() => import("./pages/admin/ContentEditor"));
const Enquiries = lazy(() => import("./pages/admin/Enquiries"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Protected = lazy(() => import("./pages/admin/Protected"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#040711]" aria-label="Loading page" />
  );
}

const routeSeo = {
  "/": {
    title: "Rajratna Web Solutions | Modern Websites & Digital Solutions",
    description:
      "Rajratna Web Solutions builds modern websites, full-stack applications, e-commerce platforms and custom digital solutions for businesses.",
  },
  "/services": {
    title: "Web Development Services | Rajratna Web Solutions",
    description:
      "Explore website development, full-stack applications, e-commerce and digital solutions from Rajratna Web Solutions.",
  },
  "/portfolio": {
    title: "Our Projects | Rajratna Web Solutions",
    description:
      "Explore real web development projects and digital experiences by Rajratna Web Solutions.",
  },
  "/process": {
    title: "Our Process | Rajratna Web Solutions",
    description:
      "See how Rajratna Web Solutions discovers, plans, designs, develops, tests and launches web projects.",
  },
  "/about": {
    title: "About Rajratna Web Solutions",
    description:
      "Learn about Rajratna Web Solutions and our work building responsive websites and custom digital solutions.",
  },
  "/contact": {
    title: "Contact Rajratna Web Solutions",
    description:
      "Contact Rajratna Web Solutions to discuss a website, web application or digital project.",
  },
  "/technologies": {
    title: "Technologies | Rajratna Web Solutions",
    description:
      "See the web technologies used by Rajratna Web Solutions to build websites and applications.",
  },
  "/privacy": {
    title: "Privacy Policy | Rajratna Web Solutions",
    description:
      "Read how Rajratna Web Solutions uses information submitted through the website contact form.",
  },
  "/terms": {
    title: "Terms & Conditions | Rajratna Web Solutions",
    description: "Read the website terms for Rajratna Web Solutions.",
  },
};

const adminRouteTitles = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/navbar": "Navbar",
  "/admin/homepage": "Homepage",
  "/admin/about": "About",
  "/admin/services": "Services",
  "/admin/projects": "Projects",
  "/admin/process": "Process",
  "/admin/technologies": "Technologies",
  "/admin/footer": "Footer",
  "/admin/faq": "FAQ",
  "/admin/testimonials": "Testimonials",
  "/admin/enquiries": "Enquiries",
  "/admin/website-settings": "Website Settings",
  "/admin/settings": "Website Settings",
  "/admin/contact-social": "Contact & Social",
  "/admin/seo": "SEO",
  "/admin/privacy": "Privacy Policy",
  "/admin/terms": "Terms & Conditions",
  "/admin/login": "Admin Login",
};

function setMeta(selector, attribute, value) {
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement("meta");
    const match = selector.match(/\[([^=]+)=\"([^\"]+)\"\]/);
    if (match) meta.setAttribute(match[1], match[2]);
    document.head.appendChild(meta);
  }
  meta.setAttribute(attribute, value);
}

function applyRouteMetadata(pathname, settings = {}) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = routeSeo[path];
  const isAdmin = path === "/admin/login" || path.startsWith("/admin");
  const savedHomeTitle = settings.seoTitle?.trim();
  const savedHomeDescription = settings.seoDescription?.trim();
  const routeKey = routeKeyFromPath(path, "");
  const pageSettings =
    (settings.pageSeo || []).find((item) => item.pageKey === routeKey) || {};
  const hasCustomHomeTitle =
    savedHomeTitle && savedHomeTitle.toLowerCase() !== "rajratna web solutions";
  const hasCustomHomeDescription =
    savedHomeDescription &&
    !savedHomeDescription
      .toLowerCase()
      .startsWith("website design & development");
  const title = isAdmin
    ? adminRouteTitles[path]
      ? `${adminRouteTitles[path]} | Rajratna Web Solutions`
      : "Page Not Found | Rajratna Web Solutions"
    : pageSettings.title ||
      (path === "/"
        ? hasCustomHomeTitle
          ? savedHomeTitle
          : routeSeo["/"].title
        : page?.title || "Page Not Found | Rajratna Web Solutions");
  const description =
    pageSettings.description ||
    (path === "/"
      ? hasCustomHomeDescription
        ? savedHomeDescription
        : routeSeo["/"].description
      : page?.description ||
        "The requested page could not be found on Rajratna Web Solutions.");
  const canonicalUrl = page
    ? pageSettings.canonicalUrl ||
      `https://rajratnawebsolutions.com${path === "/" ? "/" : path}`
    : "";
  const ogTitle = pageSettings.ogTitle || settings.ogTitle || title;
  const ogDescription =
    pageSettings.ogDescription ||
    settings.ogDescription ||
    (path === "/"
      ? "Modern websites, full-stack applications and digital solutions by Rajratna Web Solutions."
      : description);
  const ogImage = pageSettings.ogImage || settings.ogImage;
  const twitterTitle = pageSettings.twitterTitle || ogTitle;
  const twitterDescription = pageSettings.twitterDescription || ogDescription;
  const twitterImage = pageSettings.twitterImage || ogImage;
  const twitterCard =
    pageSettings.twitterCard === "summary_large_image"
      ? "summary_large_image"
      : "summary";

  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta(
    'meta[name="robots"]',
    "content",
    isAdmin || !page || pageSettings.indexable === false
      ? "noindex,nofollow"
      : "index,follow,max-image-preview:large",
  );
  setMeta('meta[property="og:title"]', "content", ogTitle);
  setMeta('meta[property="og:description"]', "content", ogDescription);
  setMeta('meta[property="og:type"]', "content", "website");
  setMeta('meta[name="twitter:card"]', "content", twitterCard);
  setMeta('meta[name="twitter:title"]', "content", twitterTitle);
  setMeta('meta[name="twitter:description"]', "content", twitterDescription);
  if (ogImage) {
    setMeta('meta[property="og:image"]', "content", ogImage);
  } else {
    document.head.querySelector('meta[property="og:image"]')?.remove();
  }
  if (twitterImage) {
    setMeta('meta[name="twitter:image"]', "content", twitterImage);
  } else {
    document.head.querySelector('meta[name="twitter:image"]')?.remove();
  }
  if (canonicalUrl) setMeta('meta[property="og:url"]', "content", canonicalUrl);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonicalUrl && !canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  if (canonicalUrl) canonical.href = canonicalUrl;
  else canonical?.remove();
}

export default function App() {
  const location = useLocation();
  // Uses the favicon saved in Admin → Settings on the public site.
  const applySiteSettings = useCallback(() => {
    pub
      .settings()
      .then((r) => {
        const settings = r.data?.data || {};
        applyRouteMetadata(location.pathname, settings);

        const url = settings.faviconUrl;
        if (!url) return;
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = url;
      })
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    applyRouteMetadata(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    applySiteSettings();
  }, [applySiteSettings]);

  useContentRefresh(applySiteSettings);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/process" element={<Process />} />
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<Protected />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="homepage"
              element={<ContentEditor section="homepage" />}
            />
            <Route
              path="services"
              element={<CMS key="services" type="services" />}
            />
            <Route
              path="projects"
              element={<CMS key="projects" type="projects" />}
            />
            <Route
              path="technologies"
              element={<CMS key="technologies" type="technologies" />}
            />
            <Route path="about" element={<ContentEditor section="about" />} />
            <Route
              path="process"
              element={<ContentEditor section="process" />}
            />
            <Route path="faq" element={<ContentEditor section="faq" />} />
            <Route
              path="testimonials"
              element={<ContentEditor section="testimonials" />}
            />
            <Route path="enquiries" element={<Enquiries />} />
            <Route
              path="settings"
              element={<Navigate to="website-settings" replace />}
            />
            <Route
              path="website-settings"
              element={<Settings section="website" />}
            />
            <Route path="navbar" element={<ContentEditor section="navbar" />} />
            <Route path="footer" element={<ContentEditor section="footer" />} />
            <Route
              path="contact-social"
              element={<ContentEditor section="contact" />}
            />
            <Route path="seo" element={<Settings section="seo" />} />
            <Route
              path="privacy"
              element={<ContentEditor section="privacy" />}
            />
            <Route path="terms" element={<ContentEditor section="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
