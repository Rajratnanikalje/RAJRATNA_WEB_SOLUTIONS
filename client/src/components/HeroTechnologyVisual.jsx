import { useEffect, useState } from "react";
import TechnologyLogo from "./TechnologyLogo";
import { technologies } from "../data/technologies";

const spherePoint = (index) => {
  const ratio = (index + 0.5) / technologies.length;
  const y = 1 - 2 * ratio;
  const radius = Math.sqrt(1 - y * y);
  const longitude = index * Math.PI * (3 - Math.sqrt(5));
  const x = Math.cos(longitude) * radius;
  const z = Math.sin(longitude) * radius;
  const frontPhase = ((-Math.atan2(x, z) / (Math.PI * 2)) % 1 + 1) % 1;
  const depthPhase = (0.5 - frontPhase + 1) % 1;

  return {
    x: `${(x * 36).toFixed(2)}%`,
    y: `${(y * 36).toFixed(2)}%`,
    z: `${Math.round(z * 150)}px`,
    smallZ: `${Math.round(z * 58)}px`,
    depthDelay: `${(-depthPhase * 34).toFixed(2)}s`,
  };
};

export default function HeroTechnologyVisual() {
  const [showTechnologyNodes, setShowTechnologyNodes] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    const showNodes = () => setShowTechnologyNodes(true);
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(showNodes, { timeout: 800 });
    } else {
      timeoutId = window.setTimeout(showNodes, 100);
    }
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="hero-tech-visual" aria-hidden="true">
      <div className="hero-tech-stage">
        <div className="hero-tech-tilt">
          <div className="hero-tech-sphere">
            <span className="hero-tech-ring hero-tech-ring--equator" />
            <span className="hero-tech-ring hero-tech-ring--meridian-a" />
            <span className="hero-tech-ring hero-tech-ring--meridian-b" />
            <span className="hero-tech-network" />
            {showTechnologyNodes && technologies.map((technology, index) => {
              const point = spherePoint(index);
              return (
                <div
                  className="hero-tech-node"
                  key={technology.name}
                  style={{
                    "--node-x": point.x,
                    "--node-y": point.y,
                    "--node-z": point.z,
                    "--node-z-small": point.smallZ,
                    "--depth-delay": point.depthDelay,
                  }}
                >
                  <div
                    className="hero-tech-card"
                    style={{ "--brand-color": technology.color }}
                  >
                    <div className="hero-tech-content">
                      <span className="hero-tech-icon">
                        <TechnologyLogo
                          technology={technology}
                          loading="eager"
                          fetchPriority="low"
                          className="hero-tech-logo"
                        />
                      </span>
                      <span className="hero-tech-name">{technology.name}</span>
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
