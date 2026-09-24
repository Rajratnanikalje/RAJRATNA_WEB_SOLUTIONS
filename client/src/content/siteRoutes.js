export const PUBLIC_ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/portfolio",
  technologies: "/technologies",
  process: "/process",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

export const PUBLIC_ROUTE_OPTIONS = Object.entries(PUBLIC_ROUTES).map(([key, path]) => ({
  value: key,
  label: `${key === "home" ? "Home" : key === "projects" ? "Projects" : key === "privacy" ? "Privacy Policy" : key === "terms" ? "Terms & Conditions" : key[0].toUpperCase() + key.slice(1)} (${path})`,
}));

export function publicPath(routeKey, fallback = "/") {
  return PUBLIC_ROUTES[routeKey] || fallback;
}

export function routeKeyFromPath(path, fallback = "contact") {
  return Object.entries(PUBLIC_ROUTES).find(([, route]) => route === path)?.[0] || fallback;
}
