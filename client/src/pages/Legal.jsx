import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { pub } from "../services/api";
import useContentRefresh from "../hooks/useContentRefresh";
import { Heading } from "../components/UI";

const content = {
  privacy: {
    title: "Privacy Policy",
    intro: "This page explains what happens when you contact Rajratna Web Solutions through this website.",
    sections: [
      ["Information you provide", "The contact form may collect your name, email address, phone number, business or company name, selected service, project details and optional budget."],
      ["How it is used", "These details are used to receive and respond to your enquiry and discuss the project you asked about."],
      ["Contact", "For questions about an enquiry or the information you submitted, use the contact details listed on this website."],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "These notes apply when you browse the Rajratna Web Solutions website.",
    sections: [
      ["Website information", "The website describes services and examples of work for general information. Project scope, deliverables, schedule and fees are discussed and agreed for each engagement."],
      ["Project links", "Portfolio links may lead to websites operated by other parties. Their content and availability are outside this website."],
      ["Questions", "Contact Rajratna Web Solutions using the contact details on this website if you have a question about these terms."],
    ],
  },
};

export default function Legal() {
  const { pathname } = useLocation();
  const [settings, setSettings] = useState({});
  const load = useCallback(() => { pub.settings().then((r) => setSettings(r.data?.data || {})).catch(() => {}); }, []);
  useEffect(load, [load]);
  useContentRefresh(load);
  const isTerms = pathname === "/terms";
  const defaults = isTerms ? content.terms : content.privacy;
  const page = isTerms
    ? { ...defaults, title: settings.termsTitle || defaults.title, eyebrow: settings.termsEyebrow || "RAJRATNA WEB SOLUTIONS", intro: settings.termsIntro || defaults.intro, sections: settings.termsSections || defaults.sections }
    : { ...defaults, title: settings.privacyTitle || defaults.title, eyebrow: settings.privacyEyebrow || "RAJRATNA WEB SOLUTIONS", intro: settings.privacyIntro || defaults.intro, sections: settings.privacySections || defaults.sections };

  return (
    <section className="section pt-40">
      <div className="container max-w-4xl">
        <Heading label={page.eyebrow} title={page.title} desc={page.intro} />
        <div className="grid gap-4 mt-10">
          {page.sections.filter((section) => section.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((section, index) => (
            <article key={section.title || index} className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold">{section.title || section[0]}</h2>
              <p className="muted text-sm leading-7 mt-3">{section.description || section[1]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
