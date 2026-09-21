import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "../components/UI";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    pub
      .projects()
      .then((r) => {
        setProjects(r.data.data || []);
        setError("");
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load projects. Please try again.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useContentRefresh(() => loadProjects(true));

  return (
    <section className="section pt-0">
      <div className="container">
        <Reveal>
          <Heading
            label="Portfolio"
            title="Selected builds."
            desc="Real projects built with modern frontend, backend and database technologies."
          />
        </Reveal>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n} className="overflow-hidden">
                <div className="h-56 bg-white/5 animate-pulse" />
                <div className="p-6 space-y-2">
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="muted">No projects available at the moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {projects.map((p, i) => (
              <Reveal key={p._id || i} delay={i * 0.06}>
                <Card className="portfolio-card group overflow-hidden h-full">
                  <div className="h-48 bg-gradient-to-br from-[#1a2a4a]/50 to-[#0a1429]/50 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-7xl font-bold text-white/5">
                        RWS
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-[#78a9ff] text-xs font-mono">
                      {p.category || "Project"}
                    </div>
                    <h3 className="font-bold text-xl mt-2 line-clamp-2 group-hover:text-[#78a9ff] transition-colors">
                      {p.name}
                    </h3>
                    {p.title && (
                      <p className="muted text-sm mt-1 line-clamp-1">
                        {p.title}
                      </p>
                    )}
                    <p className="muted text-sm leading-6 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto pt-5">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary text-xs flex-1 justify-center group-hover:border-[#78a9ff] transition-colors"
                        >
                          View Project <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        {error && <p className="text-red-300 text-sm mt-6">{error}</p>}
      </div>
    </section>
  );
}
