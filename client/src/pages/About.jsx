import {
  Code2,
  Database,
  Globe,
  Layout,
  Server,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, Reveal, Heading } from "../components/UI";

const features = [
  {
    icon: Layout,
    title: "Responsive Design",
    desc: "Mobile-first interfaces that look flawless on every device.",
  },
  {
    icon: Smartphone,
    title: "Modern Web Applications",
    desc: "Built with React, Node.js and REST APIs for performance.",
  },
  {
    icon: Database,
    title: "Database Integration",
    desc: "MongoDB & Mongoose schemas designed for scale.",
  },
  {
    icon: Code2,
    title: "Full Stack Development",
    desc: "End-to-end development from concept through deployment.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "JWT auth, input validation and security best practices.",
  },
  {
    icon: Zap,
    title: "Performance Optimised",
    desc: "Lightning-fast websites with clean, efficient code.",
  },
];

const techStack = [
  { name: "React.js", category: "Frontend" },
  { name: "JavaScript", category: "Language" },
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "REST API", category: "Architecture" },
  { name: "Git", category: "DevOps" },
];

const codeLines = [
  { text: "function buildWebsite(vision) {", color: "text-[#78a9ff]" },
  { text: "  const design = createDesign(vision);", color: "text-emerald-400" },
  { text: "  const code = develop(design);", color: "text-emerald-400" },
  { text: "  const deploy = launch(code);", color: "text-emerald-400" },
  { text: "  return deploy.toReality();", color: "text-emerald-400" },
  { text: "}", color: "text-[#78a9ff]" },
  { text: "", color: "" },
  { text: "buildWebsite('Your Vision');", color: "text-pink-400" },
  { text: "// => Your Vision | Our Code", color: "text-slate-500" },
];

export default function About() {
  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
            <div>
              <div className="label">
                <span className="eyebrow-line" />
                About Me
              </div>
              <h1 className="title">
                Crafting digital <br />
                <span className="text-gradient">experiences</span> that<br />
                mean business.
              </h1>
              <p className="muted leading-8 mt-6 text-lg max-w-xl">
                I'm <b className="text-white">Rajratna Nikalje</b>, a Web
                Developer focused on building modern, responsive and
                practical web experiences. I help businesses turn their vision
                into clean, secure, high-performing websites and web
                applications.
              </p>

              <div className="mt-8 space-y-3">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-4">
                      <div className="text-[#78a9ff] font-mono font-bold">
                        0{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#78a9ff]" />
                          <span className="font-semibold">{f.title}</span>
                        </div>
                        <p className="muted text-sm mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <Link to="/contact" className="primary">
                  Get a Free Quote
                </Link>
                <Link to="/portfolio" className="secondary">
                  View Our Work
                </Link>
              </div>
            </div>

            <Reveal delay={0.2}>
              <div className="laptop">
                <div className="laptop-screen">
                  <div className="p-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="font-mono text-sm text-slate-300">
                      {codeLines.map((line, i) => (
                        <div key={i} className="flex">
                          <span className="text-slate-600 w-12 text-right mr-3 select-none">
                            {i + 1}
                          </span>
                          <span className={line.color}>{line.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="laptop-base"></div>
              </div>
            </Reveal>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-20">
            <Heading
              label="Tech Stack"
              title="The tools I build with."
              desc="A modern toolkit, used with purpose."
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {techStack.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.04}>
                  <Card className="tech-card group p-6 text-center h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(120,169,255,.3)]">
                      <Globe size={22} className="text-slate-900" />
                    </div>
                    <div className="tech-name">{t.name}</div>
                    <div className="tech-category">{t.category}</div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
