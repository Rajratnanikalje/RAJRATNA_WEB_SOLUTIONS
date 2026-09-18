import axios from "axios";
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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
  services: () => api.get("/services/public"),
  projects: () => api.get("/projects/public"),
  technologies: () => api.get("/technologies/public"),
  settings: () => api.get("/settings/public"),
  enquiry: (d) => api.post("/enquiries", d),
  view: () => api.post("/dashboard/view"),
};
export const admin = {
  login: (d) => api.post("/auth/admin/login", d),
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
  media: {
    list: () => api.get("/media"),
    upload: (d) =>
      api.post("/media", d, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    del: (id) => api.delete(`/media/${id}`),
  },
};
export default api;
