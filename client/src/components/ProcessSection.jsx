import { useCallback, useEffect, useState } from "react";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Card, Reveal, Heading } from "./UI";

const processSteps = [
  [
    "01",
    "Discover",
    "Understand the business, goals and project requirements.",
  ],
  ["02", "Plan", "Define the structure, features and technical approach."],
  ["03", "Design", "Create a clear, responsive and user-focused interface."],
  ["04", "Develop", "Build the frontend, backend and required integrations."],
  ["05", "Test", "Review responsiveness, functionality and reliability."],
  ["06", "Launch", "Deploy the project and help with post-launch needs."],
];

export default function ProcessSection({
  standalone = false,
  settings: providedSettings,
}) {
  const [loadedSettings, setLoadedSettings] = useState({});
  const load = useCallback(() => {
    if (providedSettings) return;
    pub
      .settings()
      .then((r) => setLoadedSettings(r.data?.data || {}))
      .catch(() => {});
  }, [providedSettings]);
  useEffect(load, [load]);
  useContentRefresh(load);
  const settings = providedSettings || loadedSettings;
  if (
    (standalone && settings.processPageVisible === false) ||
    (!standalone && settings.processVisible === false)
  )
    return null;
  const steps = (
    settings.processSteps ||
    processSteps.map(([number, title, description], displayOrder) => ({
      number,
      title,
      description,
      displayOrder,
      active: true,
    }))
  )
    .filter((step) => step.active !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return (
    <section
      id={standalone ? undefined : "process"}
      className={`section ${standalone ? "pt-40" : "pt-0 scroll-mt-24"}`}
    >
      <div className="container">
        <Reveal>
          <Heading
            label={settings.processEyebrow || "Our Process"}
            title={settings.processTitle || "How We Build"}
            desc={
              settings.processDescription ||
              "A clear process from the first conversation through launch."
            }
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {steps.map((step, index) => (
            <Reveal key={step.number || step.title} delay={index * 0.04}>
              <Card className="p-6 h-full">
                <span className="font-mono text-sm text-[#78a9ff]">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold mt-3">{step.title}</h3>
                <p className="muted text-sm leading-6 mt-2">
                  {step.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
