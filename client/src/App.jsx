import { useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Technologies from "./pages/Technologies";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import CMS from "./pages/admin/CMS";
import Enquiries from "./pages/admin/Enquiries";
import Settings from "./pages/admin/Settings";
import Protected from "./pages/admin/Protected";
import { pub } from "./services/api";
import useContentRefresh from "./hooks/useContentRefresh";

export default function App() {
  // Uses the favicon saved in Admin → Settings on the public site.
  const applyFavicon = useCallback(() => {
    pub
      .settings()
      .then((r) => {
        const url = r.data?.data?.faviconUrl;
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
    applyFavicon();
  }, [applyFavicon]);

  useContentRefresh(applyFavicon);

  return (
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
  );
}
