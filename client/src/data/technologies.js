const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/";

export const technologies = [
  { name: "HTML5", category: "Frontend", icon: "html5/html5-original.svg", color: "#e44d26" },
  { name: "CSS3", category: "Frontend", icon: "css3/css3-original.svg", color: "#1572b6" },
  { name: "JavaScript", category: "Frontend", icon: "javascript/javascript-original.svg", color: "#f7df1e" },
  { name: "React.js", category: "Frontend", icon: "react/react-original.svg", color: "#61dafb" },
  { name: "TypeScript", category: "Frontend", icon: "typescript/typescript-original.svg", color: "#3178c6" },
  { name: "Next.js", category: "Frontend", icon: "nextjs/nextjs-original.svg", color: "#f8fafc", monochrome: true },
  { name: "Tailwind CSS", category: "Frontend", icon: "tailwindcss/tailwindcss-original.svg", color: "#38bdf8" },
  { name: "Redux Toolkit", category: "Frontend", icon: "redux/redux-original.svg", color: "#764abc" },
  { name: "MUI", category: "Frontend", icon: "materialui/materialui-original.svg", color: "#007fff" },
  { name: "Node.js", category: "Backend", icon: "nodejs/nodejs-original.svg", color: "#83cd29" },
  { name: "Express.js", category: "Backend", icon: "express/express-original.svg", color: "#e2e8f0", monochrome: true },
  { name: "REST API", category: "Backend", iconText: "API", color: "#78a9ff" },
  { name: "JWT", category: "Backend", fallbackIcon: "key", color: "#fbbf24" },
  { name: "MongoDB", category: "Database", icon: "mongodb/mongodb-original.svg", color: "#47a248" },
  { name: "MongoDB Atlas", category: "Database", icon: "mongodb/mongodb-original.svg", color: "#47a248" },
  { name: "Git", category: "Tools & Development", icon: "git/git-original.svg", color: "#f05032" },
  { name: "GitHub", category: "Tools & Development", icon: "github/github-original.svg", color: "#f0f6fc", monochrome: true },
  { name: "Postman", category: "Tools & Development", icon: "postman/postman-original.svg", color: "#ff6c37" },
  { name: "Vite", category: "Tools & Development", icon: "vitejs/vitejs-original.svg", color: "#bd34fe" },
  { name: "Cloudinary", category: "Cloud / Services", icon: "cloudinary/cloudinary-original.svg", color: "#f6a623" },
  { name: "WordPress", category: "CMS / E-commerce", icon: "wordpress/wordpress-original.svg", color: "#21759b" },
  { name: "WooCommerce", category: "CMS / E-commerce", icon: "woocommerce/woocommerce-original.svg", color: "#96588a" },
  { name: "Vercel", category: "Deployment", icon: "vercel/vercel-original.svg", color: "#f8fafc", monochrome: true },
  { name: "Netlify", category: "Deployment", icon: "netlify/netlify-original.svg", color: "#00c7b7" },
  { name: "Render", category: "Deployment", icon: "render/render-original.svg", color: "#46e3b7" },
];

export const technologyIconUrl = (technology) =>
  technology.icon ? `${DEVICON_BASE}${technology.icon.trim()}` : "";
