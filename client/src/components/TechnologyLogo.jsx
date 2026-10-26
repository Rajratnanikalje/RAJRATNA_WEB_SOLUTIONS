import { useState } from "react";
import { Code2, KeyRound } from "lucide-react";
import { technologyIconUrl } from "../data/technologies";

export default function TechnologyLogo({
  technology,
  className = "",
  alt = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority,
}) {
  const src = technologyIconUrl(technology);
  const [iconFailed, setIconFailed] = useState(false);
  if (src && !iconFailed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        onError={() => setIconFailed(true)}
        style={technology.monochrome ? { filter: "brightness(0) invert(1)" } : undefined}
      />
    );
  }

  if (technology.iconText) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold ${className}`}
        aria-hidden="true"
      >
        {technology.iconText}
      </span>
    );
  }

  const FallbackIcon = technology.fallbackIcon === "key" ? KeyRound : Code2;
  return <FallbackIcon className={className} aria-label={alt || technology.name} />;
}
