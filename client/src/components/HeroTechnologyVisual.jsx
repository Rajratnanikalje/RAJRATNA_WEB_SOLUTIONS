import { Atom, Cloud, Code2, GitBranch, Github } from "lucide-react";

const technologies = [
  { name: "React", color: "react", icon: <Atom size={28} strokeWidth={1.8} /> },
  {
    name: "JavaScript",
    color: "javascript",
    icon: <span className="hero-tech-js">JS</span>,
  },
  {
    name: "HTML5",
    color: "html",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 2h18l-1.7 18.1L12 22l-7.3-1.9L3 2Z" fill="currentColor" />
        <path d="M8 7h8l-.2 2H10l.2 2h5.4l-.6 5.1-3 .8-3-.8-.2-2h2l.1.5 1.1.3 1.1-.3.2-1.7H8.3L8 7Z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "CSS3",
    color: "css",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 2h18l-1.7 18.1L12 22l-7.3-1.9L3 2Z" fill="currentColor" />
        <path d="M8 7h8l-.2 2h-5.5l.1 1.4h5.2l-.6 5.7-3 .8-3-.8-.2-2h2l.1.5 1.1.3 1.1-.3.2-2.2H8.5L8 7Z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    color: "node",
    icon: (
      <svg viewBox="0 0 36 30" aria-hidden="true">
        <path
          d="m18 2 13 7.5v11L18 28 5 20.5v-11L18 2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="18"
          y="17.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          fontSize="8"
          fontWeight="700"
        >
          node
        </text>
      </svg>
    ),
  },
  {
    name: "Express",
    color: "express",
    icon: <span className="hero-tech-express">ex</span>,
  },
  {
    name: "MongoDB",
    color: "mongo",
    icon: (
      <svg viewBox="0 0 24 28" aria-hidden="true">
        <path
          d="M12 1C8.3 6.2 5 9.4 5 15a7 7 0 0 0 6 6.9V26h2v-4.1A7 7 0 0 0 19 15c0-5.6-3.3-8.8-7-14Z"
          fill="currentColor"
        />
        <path
          d="M12 5v17"
          fill="none"
          stroke="#092018"
          strokeOpacity=".6"
          strokeWidth=".8"
        />
      </svg>
    ),
  },
  { name: "REST API", color: "api", icon: <Code2 size={25} strokeWidth={2} /> },
  { name: "Git", color: "git", icon: <GitBranch size={26} strokeWidth={2} /> },
  { name: "GitHub", color: "github", icon: <Github size={27} strokeWidth={1.9} /> },
  {
    name: "Tailwind CSS",
    color: "tailwind",
    icon: (
      <svg viewBox="0 0 32 24" aria-hidden="true">
        <path
          d="M8 7c1-4 4-6 8-6 5 0 7 3 9 7-1-2-3-3-5-3-3 0-5 2-7 5-2 3-4 5-7 5-2 0-4-1-5-3 2 1 4 0 5-2l2-3Zm8 10c2-3 4-5 7-5 2 0 4 1 5 3-2-1-4 0-5 2l-2 3c-1 2-4 3-7 3-5 0-7-3-9-7 1 2 3 3 5 3 3 0 5-1 6-2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Vercel",
    color: "vercel",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 22 21H2L12 3Z" fill="currentColor" />
      </svg>
    ),
  },
  { name: "Cloudinary", color: "cloudinary", icon: <Cloud size={27} strokeWidth={1.8} /> },
];

const latitudeBands = [
  { latitude: -0.66, count: 4, offset: 0 },
  { latitude: 0, count: 5, offset: 0.1 },
  { latitude: 0.66, count: 4, offset: 0.28 },
];

const spherePoints = latitudeBands.flatMap(({ latitude, count, offset }) => {
  const radius = Math.sqrt(1 - latitude * latitude);
  return Array.from({ length: count }, (_, index) => {
    const longitude = ((index / count + offset) * Math.PI * 2) % (Math.PI * 2);
    const x = Math.cos(longitude) * radius;
    const z = Math.sin(longitude) * radius;
    const frontPhase = ((-Math.atan2(x, z) / (Math.PI * 2)) % 1 + 1) % 1;
    const depthPhase = (0.5 - frontPhase + 1) % 1;

    return {
      x: `${(x * 35).toFixed(2)}%`,
      // Match the horizontal radius so the node envelope projects as a circle.
      y: `${(latitude * 53).toFixed(2)}%`,
      z: `${Math.round(z * 150)}px`,
      smallZ: `${Math.round(z * 58)}px`,
      depthDelay: `${(-depthPhase * 34).toFixed(2)}s`,
    };
  });
});

export default function HeroTechnologyVisual() {
  return (
    <div className="hero-tech-visual" aria-hidden="true">
      <div className="hero-tech-stage">
        <div className="hero-tech-tilt">
          <div className="hero-tech-sphere">
            <span className="hero-tech-ring hero-tech-ring--equator" />
            <span className="hero-tech-ring hero-tech-ring--meridian-a" />
            <span className="hero-tech-ring hero-tech-ring--meridian-b" />
            <span className="hero-tech-network" />
            {technologies.map(({ name, color, icon }, index) => {
              const point = spherePoints[index];
              return (
                <div
                  className="hero-tech-node"
                  key={name}
                  style={{
                    "--node-x": point.x,
                    "--node-y": point.y,
                    "--node-z": point.z,
                    "--node-z-small": point.smallZ,
                    "--depth-delay": point.depthDelay,
                  }}
                >
                  <div className="hero-tech-card" data-brand={color}>
                    <div className="hero-tech-content">
                      <span className="hero-tech-icon">{icon}</span>
                      <span className="hero-tech-name">{name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
