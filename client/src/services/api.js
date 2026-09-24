import axios from "axios";
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const NEW_ENQUIRY_SIGNAL_KEY = "rws_new_enquiry_created";

export function notifyEnquiryCreated() {
  window.dispatchEvent(new Event("rws:new-enquiry"));
  try {
    localStorage.setItem(NEW_ENQUIRY_SIGNAL_KEY, `${Date.now()}-${Math.random()}`);
  } catch {
    // The Admin Panel's short-interval refresh remains as a fallback.
  }
}

const api = axios.create({ baseURL: API });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("rws_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("rws_token")) {
      localStorage.removeItem("rws_token");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(error);
  },
);
export const pub = {
  services: () => api.get("/services/public", { params: { _t: Date.now() } }),
  projects: () => api.get("/projects/public", { params: { _t: Date.now() } }),
  technologies: () => api.get("/technologies/public", { params: { _t: Date.now() } }),
  settings: () => api.get("/settings/public", { params: { _t: Date.now() } }),
  enquiry: (d) => api.post("/enquiries", d),
  view: () => api.post("/dashboard/view"),
};
export const admin = {
  login: (d) => api.post("/auth/admin/login", d),
  forgotPassword: (d) => api.post("/auth/admin/forgot-password", d),
  verifyOtp: (d) => api.post("/auth/admin/verify-otp", d),
  resetPassword: (d) => api.post("/auth/admin/reset-password", d),
  requestAccountOtp: () => api.post("/auth/admin/account/otp"),
  verifyAccountOtp: (d) => api.post("/auth/admin/account/verify-otp", d),
  updateAccount: (d) => api.put("/auth/admin/account", d),
  dashboard: () => api.get("/dashboard"),
  services: {
    list: () => api.get("/services"),
    save: (id, d) =>
      id ? api.put(`/services/${id}`, d) : api.post("/services", d),
    del: (id) => api.delete(`/services/${id}`),
  },
  projects: {
    list: () => api.get("/projects"),
    save: (id, d) =>
      id ? api.put(`/projects/${id}`, d) : api.post("/projects", d),
    del: (id) => api.delete(`/projects/${id}`),
  },
  technologies: {
    list: () => api.get("/technologies"),
    save: (id, d) =>
      id ? api.put(`/technologies/${id}`, d) : api.post("/technologies", d),
    del: (id) => api.delete(`/technologies/${id}`),
  },
  enquiries: {
    list: () => api.get("/enquiries"),
    update: (id, d) => api.patch(`/enquiries/${id}`, d),
    del: (id) => api.delete(`/enquiries/${id}`),
  },
  settings: {
    get: () => api.get("/settings"),
    save: (d) => api.put("/settings", d),
  },
  uploads: {
    image: (file) => {
      const data = new FormData();
      data.append("image", file);
      return api.post("/uploads/image", data);
    },
  },
};
export default api;
