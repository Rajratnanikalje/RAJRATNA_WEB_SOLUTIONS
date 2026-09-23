import { lazy, Suspense, useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Technologies from "./pages/Technologies";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { pub } from "./services/api";
import useContentRefresh from "./hooks/useContentRefresh";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CMS = lazy(() => import("./pages/admin/CMS"));
const Enquiries = lazy(() => import("./pages/admin/Enquiries"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Protected = lazy(() => import("./pages/admin/Protected"));

function PageFallback() {
  return <div className="min-h-screen bg-[#040711]" aria-label="Loading page" />;
}

export default function App() {
  // Uses the favicon saved in Admin → Settings on the public site.
  const applySiteSettings = useCallback(() => {
    pub
      .settings()
      .then((r) => {
        const settings = r.data?.data || {};
        const title = settings.seoTitle || settings.siteTitle || "Rajratna Web Solutions";
        const description = settings.seoDescription || "Rajratna Web Solutions — Website Design & Development. Your Vision | Our Code.";

        document.title = title;

        const setMeta = (selector, attribute, value) => {
          let meta = document.head.querySelector(selector);
          if (!meta) {
            meta = document.createElement("meta");
            const match = selector.match(/\[([^=]+)=\"([^\"]+)\"\]/);
            if (match) meta.setAttribute(match[1], match[2]);
            document.head.appendChild(meta);
          }
          meta.setAttribute(attribute, value);
        };

        setMeta('meta[name="description"]', "content", description);
        setMeta('meta[property="og:title"]', "content", title);
        setMeta('meta[property="og:description"]', "content", description);
        setMeta('meta[name="twitter:title"]', "content", title);
        setMeta('meta[name="twitter:description"]', "content", description);

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
  }, []);

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
        <Route path="/technologies" element={<Technologies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<Protected />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<CMS key="services" type="services" />} />
          <Route path="projects" element={<CMS key="projects" type="projects" />} />
          <Route path="technologies" element={<CMS key="technologies" type="technologies" />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      </Routes>
    </Suspense>
  );
}
