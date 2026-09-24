import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { admin } from "../../services/api";
import { notifyContentUpdated } from "../../hooks/useContentRefresh";
import ImageUploader from "../../components/ImageUploader";
import { Card } from "../../components/UI";
import { PUBLIC_ROUTE_OPTIONS } from "../../content/siteRoutes";

const routeField = { key: "routeKey", label: "Link destination", type: "select", options: PUBLIC_ROUTE_OPTIONS };
const visibleField = { key: "visible", label: "Visible", type: "checkbox" };
const featureIconOptions = ["Layout", "Smartphone", "Database", "Code2", "Shield", "Zap"].map((value) => ({ value, label: value }));
const reasonIconOptions = ["Layers3", "Code2", "MonitorSmartphone", "Braces", "ShieldCheck", "Zap", "Database", "MessageCircle"].map((value) => ({ value, label: value }));

const whyDefaults = [
  ["Custom-Built Solutions", "Features and interfaces shaped around the project requirements."],
  ["Modern Technology", "Current frontend and backend tools chosen to suit the work."],
  ["Responsive Design", "Layouts designed to work across phones, tablets and larger screens."],
  ["Clean Architecture", "Organised components and code that are easier to maintain."],
  ["Secure Development", "Validation and established security practices built into delivery."],
  ["Performance Focused", "Lean pages and considered assets for a smoother experience."],
  ["Scalable Solutions", "A foundation that can grow with features and content needs."],
  ["Post-Launch Support", "Help with launch follow-up and ongoing website improvements."],
].map(([title, description], displayOrder) => ({ title, description, displayOrder, active: true }));

const processDefaults = [
  ["01", "Discover", "Understand the business, goals and project requirements."],
  ["02", "Plan", "Define the structure, features and technical approach."],
  ["03", "Design", "Create a clear, responsive and user-focused interface."],
  ["04", "Develop", "Build the frontend, backend and required integrations."],
  ["05", "Test", "Review responsiveness, functionality and reliability."],
  ["06", "Launch", "Deploy the project and help with post-launch needs."],
].map(([number, title, description], displayOrder) => ({ number, title, description, displayOrder, active: true }));

const faqDefaults = [
  ["What type of websites do you build?", "Business websites, portfolios, e-commerce experiences and custom web applications."],
  ["Do you build full-stack applications?", "Yes. Projects can include a React frontend, backend APIs and database integration."],
  ["Can you create e-commerce websites?", "Yes. E-commerce features can be planned around the products and shopping flow you need."],
  ["Can you build custom admin dashboards?", "Yes. Custom dashboards and content management tools can be built for project workflows."],
  ["Do you provide website maintenance?", "Maintenance and follow-up support can be discussed based on your website and needs."],
  ["Can you integrate APIs and third-party services?", "Yes. API and service integrations can be included when they fit the project requirements."],
  ["Do you provide deployment and hosting support?", "Deployment and hosting setup support are available for web projects."],
].map(([question, answer], displayOrder) => ({ question, answer, displayOrder, active: true }));

const aboutHighlightDefaults = [
  ["Responsive Design", "Mobile-first interfaces that look flawless on every device.", "Layout"],
  ["Modern Web Applications", "Built with React, Node.js and REST APIs for performance.", "Smartphone"],
  ["Database Integration", "MongoDB & Mongoose schemas designed for scale.", "Database"],
  ["Full Stack Development", "End-to-end development from concept through deployment.", "Code2"],
  ["Secure & Reliable", "JWT auth, input validation and security best practices.", "Shield"],
  ["Performance Optimised", "Lightning-fast websites with clean, efficient code.", "Zap"],
].map(([title, description, iconKey], displayOrder) => ({ title, description, iconKey, displayOrder, active: true }));

const privacyDefaults = [
  ["Information you provide", "The contact form may collect your name, email address, phone number, business or company name, selected service, project details and optional budget."],
  ["How it is used", "These details are used to receive and respond to your enquiry and discuss the project you asked about."],
  ["Contact", "For questions about an enquiry or the information you submitted, use the contact details listed on this website."],
].map(([title, description], displayOrder) => ({ title, description, displayOrder, active: true }));

const termsDefaults = [
  ["Website information", "The website describes services and examples of work for general information. Project scope, deliverables, schedule and fees are discussed and agreed for each engagement."],
  ["Project links", "Portfolio links may lead to websites operated by other parties. Their content and availability are outside this website."],
  ["Questions", "Contact Rajratna Web Solutions using the contact details on this website if you have a question about these terms."],
].map(([title, description], displayOrder) => ({ title, description, displayOrder, active: true }));

const baseHeroFields = [
  { key: "homeHeroEyebrow", label: "Eyebrow text", fallback: "YOUR VISION • OUR CODE • DIGITAL SUCCESS" },
  { key: "homeHeroTitle", label: "Main title", fallback: "RAJRATNA ." },
  { key: "homeHeroSecondaryTitle", label: "Second title line", fallback: "WEB" },
  { key: "homeHeroThirdTitle", label: "Third title line", fallback: "SOLUTION" },
  { key: "homeHeroSubtitle", label: "Supporting heading", fallback: "Build Your Ideas Into Powerful Digital Experiences", textarea: true },
  { key: "homeHeroDescription", label: "Description", fallback: "We create modern websites, powerful web applications and digital solutions that help your business grow in the digital world.", textarea: true },
  { key: "homeHeroCtaText", label: "CTA text", fallback: "Let's Build Together" },
  { key: "homeHeroCtaRouteKey", label: "CTA destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "contact" },
  { key: "heroImageUrl", label: "Background image", image: true },
  { key: "heroVisible", label: "Hero section visible", checkbox: true, fallback: true },
  { key: "heroCtaVisible", label: "Hero button visible", checkbox: true, fallback: true },
  { key: "homeHeroVerticalVisible", label: "Right-side words visible", checkbox: true, fallback: true },
];

const configs = {
  homepage: {
    title: "Homepage",
    description: "Edit homepage content and control which sections are visible. Layout and design stay in the website code.",
    fields: [...baseHeroFields,
      ...["about", "services", "projects", "technologies", "why", "process", "faq", "testimonials", "finalCta"].map((key) => ({ key: `${key}Visible`, label: `${key === "finalCta" ? "Final CTA" : key} section visible`, checkbox: true, fallback: true })),
      { key: "homeAboutEyebrow", label: "About section eyebrow", fallback: "About RWS" },
      { key: "homeAboutTitle", label: "About section heading", fallback: "Building Digital Experiences That Matter." },
      { key: "homeAboutDescription", label: "About section description", textarea: true, fallback: "Rajratna Web Solutions is a modern web development studio focused on creating responsive websites, full-stack applications and digital solutions for businesses and ideas." },
      { key: "homeAboutCtaText", label: "About section link text", fallback: "More about RWS" },
      { key: "homeAboutCtaRouteKey", label: "About section link destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "about" },
      { key: "homeServicesEyebrow", label: "Services section eyebrow", fallback: "Services" },
      { key: "homeServicesTitle", label: "Services section heading", fallback: "What We Build" },
      { key: "homeServicesDescription", label: "Services section description", fallback: "Digital solutions designed around your business goals." },
      { key: "homeServicesCtaText", label: "Services section link text", fallback: "Explore services" },
      { key: "homeServicesCtaRouteKey", label: "Services section link destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "services" },
      { key: "homeProjectsEyebrow", label: "Projects section eyebrow", fallback: "Portfolio" },
      { key: "homeProjectsTitle", label: "Projects section heading", fallback: "Featured Projects" },
      { key: "homeProjectsDescription", label: "Projects section description", fallback: "Real products and digital experiences built with modern technologies." },
      { key: "homeProjectsCtaText", label: "Projects section link text", fallback: "Explore all projects" },
      { key: "homeProjectsCtaRouteKey", label: "Projects section link destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "projects" },
      { key: "homeTechnologiesEyebrow", label: "Technologies section eyebrow", fallback: "Technology" },
      { key: "homeTechnologiesTitle", label: "Technologies section heading", fallback: "Technologies We Use" },
      { key: "homeTechnologiesDescription", label: "Technologies section description", fallback: "A practical stack selected to fit the needs of each project." },
      { key: "homeWhyEyebrow", label: "Why RWS eyebrow", fallback: "Why RWS" },
      { key: "processEyebrow", label: "Process section eyebrow", fallback: "Our Process" },
      { key: "homeFaqEyebrow", label: "FAQ eyebrow", fallback: "FAQ" },
      { key: "homeFaqTitle", label: "FAQ heading", fallback: "A Few Common Questions" },
      { key: "homeFaqDescription", label: "FAQ description", fallback: "Some details that help make the first conversation easier." },
      { key: "homeTestimonialsEyebrow", label: "Testimonials eyebrow", fallback: "Testimonials" },
      { key: "homeTestimonialsTitle", label: "Testimonials heading", fallback: "Client Feedback" },
      { key: "homeTestimonialsDescription", label: "Testimonials description", fallback: "Experiences shared by clients." },
      { key: "finalCtaTitle", label: "Final CTA heading", fallback: "Let's Build Something Great Together." },
      { key: "finalCtaEyebrow", label: "Final CTA eyebrow", fallback: "A good place to start" },
      { key: "finalCtaDescription", label: "Final CTA description", fallback: "Explore the project approach, or tell us a little about what you have in mind." },
      { key: "finalCtaButtonText", label: "Final CTA button text", fallback: "Have a Project in Mind?" },
      { key: "finalCtaButtonRouteKey", label: "Final CTA button destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "contact" },
      { key: "finalCtaWhatsappText", label: "WhatsApp button label", fallback: "WhatsApp Us" },
      { key: "whyTitle", label: "Why RWS heading", fallback: "Why Choose Rajratna Web Solutions?" },
      { key: "whyDescription", label: "Why RWS description", fallback: "A thoughtful approach to building and supporting your digital product." },
    ],
    lists: [
      { key: "homeHeroVerticalWords", label: "Hero right-side words", visibilityKey: "visible", fields: [{ key: "label", label: "Word" }], newItem: { label: "", visible: true }, defaults: ["Design", "Develop", "Deploy", "Grow"].map((label, displayOrder) => ({ label, displayOrder, visible: true })) },
      { key: "whyItems", label: "Why RWS items", fields: ["title", "description", { key: "iconKey", label: "Icon", type: "select", options: reasonIconOptions }], defaults: whyDefaults },
      { key: "faqItems", label: "Homepage FAQ", fields: ["question", "answer"], defaults: faqDefaults },
    ],
  },
  about: {
    title: "About",
    description: "Manage the About page content and highlights.",
    fields: [
      { key: "aboutPageVisible", label: "About page visible", checkbox: true, fallback: true },
      { key: "aboutEyebrow", label: "Page eyebrow", fallback: "About Rajratna Web Solutions" },
      { key: "aboutTitle", label: "Page heading", fallback: "Building Digital Experiences That Matter." },
      { key: "aboutDescription", label: "Intro text", textarea: true, fallback: "Rajratna Web Solutions is a modern web development studio focused on creating responsive websites, full-stack applications and digital solutions for businesses and ideas." },
      { key: "aboutImageUrl", label: "About image", image: true },
      { key: "aboutPrimaryCtaText", label: "Primary CTA text", fallback: "Get a Free Quote" },
      { key: "aboutPrimaryCtaRouteKey", label: "Primary CTA destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "contact" },
      { key: "aboutSecondaryCtaText", label: "Secondary CTA text", fallback: "View Our Work" },
      { key: "aboutSecondaryCtaRouteKey", label: "Secondary CTA destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "projects" },
      { key: "aboutTechVisible", label: "Technology section visible", checkbox: true, fallback: true },
      { key: "aboutTechEyebrow", label: "Technology section eyebrow", fallback: "Tech Stack" },
      { key: "aboutTechTitle", label: "Technology section heading", fallback: "The tools I build with." },
      { key: "aboutTechDescription", label: "Technology section description", fallback: "A modern toolkit, used with purpose." },
    ],
    lists: [{ key: "aboutHighlights", label: "Highlights", fields: ["title", "description", { key: "iconKey", label: "Icon", type: "select", options: featureIconOptions }], defaults: aboutHighlightDefaults }],
  },
  process: { title: "Process", description: "Edit the process page and section copy, visibility, and ordered steps.", fields: [{ key: "processPageVisible", label: "Process page visible", checkbox: true, fallback: true }, { key: "processEyebrow", label: "Eyebrow", fallback: "Our Process" }, { key: "processTitle", label: "Heading", fallback: "How We Build" }, { key: "processDescription", label: "Description", textarea: true, fallback: "A clear process from the first conversation through launch." }], lists: [{ key: "processSteps", label: "Process steps", fields: ["number", "title", "description"], defaults: processDefaults }] },
  faq: { title: "FAQ", description: "Manage questions and answers displayed on the homepage.", lists: [{ key: "faqItems", label: "Frequently asked questions", fields: ["question", "answer"], defaults: faqDefaults }] },
  testimonials: { title: "Testimonials", description: "Add genuine customer testimonials. No testimonials are prefilled.", lists: [{ key: "testimonials", label: "Testimonials", fields: ["clientName", "company", "testimonial", { key: "profileImageUrl", label: "Profile image" }, { key: "featured", label: "Featured on homepage", type: "checkbox" }], defaults: [] }] },
  navbar: { title: "Navbar", description: "Change navigation branding, labels, visibility, order and button content. Destinations are restricted to existing application routes.", fields: [{ key: "logoUrl", label: "Navbar logo", image: true }, { key: "brandPrimaryText", label: "Brand first line", fallback: "RAJRATNA ." }, { key: "brandSecondaryText", label: "Brand second line", fallback: "WEB SOLUTIONS" }, { key: "navbarCtaText", label: "Navbar CTA text", fallback: "Start a Project" }, { key: "navbarCtaRouteKey", label: "Navbar CTA destination", type: "select", options: PUBLIC_ROUTE_OPTIONS, fallback: "contact" }, { key: "navbarCtaVisible", label: "Navbar CTA visible", checkbox: true, fallback: true }], lists: [{ key: "navbarItems", label: "Navigation items", visibilityKey: "visible", fields: [{ key: "label", label: "Link label" }, { ...routeField, label: "Existing page destination" }, visibleField], defaults: [["Home", "home"], ["About", "about"], ["Services", "services"], ["Projects", "projects"], ["Process", "process"], ["Contact", "contact"]].map(([label, routeKey], displayOrder) => ({ label, routeKey, visible: true, displayOrder })) }] },
  footer: { title: "Footer", description: "Manage footer content, link lists and column visibility. Link targets use existing public routes.", fields: [
    { key: "footerLogoUrl", label: "Footer logo", image: true },
    { key: "footerDescription", label: "Footer description", textarea: true, fallback: "Modern websites, full-stack applications and digital solutions for businesses." },
    { key: "footerQuickLinksHeading", label: "Quick Links heading", fallback: "Pages" },
    { key: "footerServicesHeading", label: "Services column heading", fallback: "What We Build" },
    { key: "footerContactHeading", label: "Contact column heading", fallback: "Contact" },
    { key: "footerPhone", label: "Footer phone", fallback: "" }, { key: "footerEmail", label: "Footer email", fallback: "" }, { key: "footerWhatsapp", label: "Footer WhatsApp number or link", fallback: "" }, { key: "footerLocation", label: "Footer address", fallback: "" }, { key: "footerSocialLinks", label: "Footer social URLs (one per line)", textarea: true, lines: true, fallback: "" },
    { key: "footerCopyrightText", label: "Copyright text ({year} and {siteTitle} are supported)", fallback: "© {year} RAJRATNA WEB SOLUTIONS. All rights reserved." },
    { key: "footerTagline", label: "Footer tagline", fallback: "Website Design & Development" },
    { key: "footerPrivacyLabel", label: "Privacy Policy link label", fallback: "Privacy Policy" },
    { key: "footerTermsLabel", label: "Terms link label", fallback: "Terms & Conditions" },
    { key: "footerWhatsappLabel", label: "WhatsApp link label", fallback: "WhatsApp" },
    ...["footerBrandVisible", "footerQuickLinksVisible", "footerServicesVisible", "footerContactVisible", "footerSocialVisible", "footerShowPhone", "footerShowEmail", "footerShowWhatsapp", "footerShowLocation"].map((key) => ({ key, label: key.replace(/^footer/, "").replace(/([A-Z])/g, " $1").trim(), checkbox: true, fallback: true })),
  ], lists: [
    { key: "footerQuickLinks", label: "Quick links", visibilityKey: "visible", fields: [{ key: "label", label: "Link label" }, { ...routeField, label: "Existing page destination" }], newItem: { label: "", routeKey: "home", visible: true }, defaults: [["Home", "home"], ["About", "about"], ["Services", "services"], ["Projects", "projects"], ["Process", "process"], ["Technologies", "technologies"], ["Contact", "contact"], ["Privacy Policy", "privacy"], ["Terms & Conditions", "terms"]].map(([label, routeKey], displayOrder) => ({ label, routeKey, visible: true, displayOrder })) },
    { key: "footerServiceLinks", label: "Services links", visibilityKey: "visible", fields: [{ key: "label", label: "Link label" }, { ...routeField, label: "Existing page destination" }], newItem: { label: "", routeKey: "services", visible: true }, defaults: [["Websites & Web Applications", "services"], ["E-Commerce & Dashboards", "services"], ["APIs & Integrations", "services"]].map(([label, routeKey], displayOrder) => ({ label, routeKey, visible: true, displayOrder })) },
  ] },
  contact: { title: "Contact & Social", description: "Edit visible contact page copy and form labels. Submission fields and validation stay connected to the existing enquiry API.", fields: [
    { key: "contactEyebrow", label: "Page eyebrow", fallback: "CONTACT" }, { key: "contactTitle", label: "Page heading", fallback: "Send Us a Message" }, { key: "contactDescription", label: "Page description", textarea: true, fallback: "Tell us what you need and our team will get back to you." }, { key: "contactSocialLabel", label: "Social links heading", fallback: "Social" },
    { key: "email", label: "Business email", fallback: "" }, { key: "phone", label: "Phone", fallback: "" }, { key: "whatsapp", label: "WhatsApp number or link", fallback: "" }, { key: "contactWhatsappUrl", label: "WhatsApp click URL (optional)", fallback: "" }, { key: "location", label: "Location / address", fallback: "" }, { key: "socialLinks", label: "Social URLs (one per line)", textarea: true, lines: true, fallback: "" },
    ...[{key:"contactPhoneLabel",label:"Phone contact label",fallback:"Phone"},{key:"contactEmailLabel",label:"Email contact label",fallback:"Email"},{key:"contactLocationLabel",label:"Location contact label",fallback:"Location"},{key:"contactWhatsappLabel",label:"WhatsApp label",fallback:"WhatsApp"},{key:"contactNameLabel",label:"Name field label",fallback:"Full Name"},{key:"contactNamePlaceholder",label:"Name placeholder",fallback:"Your full name"},{key:"contactEmailFieldLabel",label:"Email field label",fallback:"Email Address"},{key:"contactEmailPlaceholder",label:"Email placeholder",fallback:"you@example.com"},{key:"contactPhoneFieldLabel",label:"Phone field label",fallback:"Phone Number"},{key:"contactPhonePlaceholder",label:"Phone placeholder",fallback:"Phone number"},{key:"contactCompanyLabel",label:"Company field label",fallback:"Business / Company"},{key:"contactCompanyPlaceholder",label:"Company placeholder",fallback:"Business or company name (optional)"},{key:"contactServiceLabel",label:"Service field label",fallback:"Service Interested In"},{key:"contactOtherServiceLabel",label:"Other service option",fallback:"Other"},{key:"contactServicePlaceholder",label:"Service placeholder",fallback:"Select a service"},{key:"contactBudgetLabel",label:"Budget field label",fallback:"Budget"},{key:"contactOptionalLabel",label:"Optional field hint",fallback:"Optional"},{key:"contactBudgetPlaceholder",label:"Budget placeholder",fallback:"Your estimated budget (optional)"},{key:"contactMessageLabel",label:"Message field label",fallback:"Project Details"},{key:"contactMessagePlaceholder",label:"Message placeholder",fallback:"How can we help with your project?"},{key:"contactSubmitLabel",label:"Submit button label",fallback:"Send Message"},{key:"contactSendingLabel",label:"Sending state label",fallback:"Sending..."},{key:"contactSuccessMessage",label:"Success message",fallback:"Your enquiry has been received. We'll get back to you soon."}].map((field) => ({ ...field, textarea: ["contactDescription", "contactSuccessMessage"].includes(field.key) })),
  ] },
  privacy: { title: "Privacy Policy", description: "Edit the existing public Privacy Policy page.", fields: [{ key: "privacyTitle", label: "Page title", fallback: "Privacy Policy" }, { key: "privacyEyebrow", label: "Eyebrow", fallback: "RAJRATNA WEB SOLUTIONS" }, { key: "privacyIntro", label: "Introduction", textarea: true, fallback: "This page explains what happens when you contact Rajratna Web Solutions through this website." }], lists: [{ key: "privacySections", label: "Policy sections", fields: ["title", "description"], defaults: privacyDefaults }] },
  terms: { title: "Terms & Conditions", description: "Edit the existing public Terms page.", fields: [{ key: "termsTitle", label: "Page title", fallback: "Terms & Conditions" }, { key: "termsEyebrow", label: "Eyebrow", fallback: "RAJRATNA WEB SOLUTIONS" }, { key: "termsIntro", label: "Introduction", textarea: true, fallback: "These notes apply when you browse the Rajratna Web Solutions website." }], lists: [{ key: "termsSections", label: "Terms sections", fields: ["title", "description"], defaults: termsDefaults }] },
};

function defaultEntry(fields, index) {
  return Object.fromEntries(fields.map((field) => {
    const key = typeof field === "string" ? field : field.key;
    return [key, key === "displayOrder" ? index : key === "active" || key === "visible" ? true : ""];
  }));
}

function ListEditor({ config, value, onChange }) {
  const items = Array.isArray(value) ? value : config.defaults;
  const visibilityKey = config.visibilityKey || "active";
  const setItem = (index, key, next) => onChange(items.map((item, i) => i === index ? { ...item, [key]: next } : item));
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, displayOrder: i })));
  };
  return <div className="grid gap-3">
    {items.map((item, index) => <div key={`${config.key}-${index}`} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 grid gap-3">
      <div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Item {index + 1}</span><div className="flex items-center gap-1"><button type="button" className="secondary !p-2" onClick={() => move(index, -1)} aria-label="Move up"><ArrowUp size={14}/></button><button type="button" className="secondary !p-2" onClick={() => move(index, 1)} aria-label="Move down"><ArrowDown size={14}/></button><button type="button" className="secondary !p-2 text-red-300" onClick={() => { if (window.confirm("Remove this item? Save & Publish to apply the change.")) onChange(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, displayOrder: i }))); }} aria-label="Delete"><Trash2 size={14}/></button></div></div>
      {config.fields.map((rawField) => {
        const field = typeof rawField === "string" ? { key: rawField, label: rawField.replace(/([A-Z])/g, " $1").replace(/^./, (x) => x.toUpperCase()) } : rawField;
        return <label key={field.key} className="grid gap-1 text-xs text-slate-400">{field.label}
          {field.type === "select" ? <select className="input" value={item[field.key] || ""} onChange={(e) => setItem(index, field.key, e.target.value)}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            : field.type === "checkbox" ? <span className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={item[field.key] !== false} onChange={(e) => setItem(index, field.key, e.target.checked)}/> {field.label}</span>
              : field.key === "profileImageUrl" ? <ImageUploader value={item[field.key] || ""} onChange={(url) => setItem(index, field.key, url)} previewHeight="h-28" hint="Optional client profile image; upload a real client image only." />
                : <textarea className="input" rows={["description", "answer", "testimonial"].includes(field.key) ? 3 : 1} value={item[field.key] || ""} onChange={(e) => setItem(index, field.key, e.target.value)} maxLength={5000} />}
        </label>;
      })}
      <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={item[visibilityKey] !== false} onChange={(e) => setItem(index, visibilityKey, e.target.checked)}/> {visibilityKey === "visible" ? "Visible on public website" : "Published / Active"}</label>
    </div>)}
    {!items.length && <p className="muted rounded-xl border border-white/5 p-4 text-sm">No items yet.</p>}
    <button type="button" className="secondary justify-center" onClick={() => onChange([...items, { ...defaultEntry(config.fields, items.length), ...(config.newItem || {}), [visibilityKey]: true, displayOrder: items.length }])}><Plus size={15}/> Add item</button>
  </div>;
}

export default function ContentEditor({ section }) {
  const config = configs[section];
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    admin.settings.get().then((response) => {
      const data = response.data.data || {};
      const legacyTitleLines = String(data.homeHeroTitle || "").replace(/\\n/g, "\n").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      setValues({
        ...data,
        socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks.join("\n") : "",
        footerSocialLinks: Array.isArray(data.footerSocialLinks) ? data.footerSocialLinks.join("\n") : "",
        homeHeroTitle: legacyTitleLines.length > 1 ? legacyTitleLines[0] : data.homeHeroTitle || "RAJRATNA .",
        homeHeroSecondaryTitle: data.homeHeroSecondaryTitle || legacyTitleLines[1] || "WEB",
        homeHeroThirdTitle: data.homeHeroThirdTitle || legacyTitleLines[2] || "SOLUTION",
      });
    })
      .catch((e) => setError(e.response?.data?.message || "Could not load content."))
      .finally(() => setLoading(false));
  }, []);

  const setValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    const payload = {};
    for (const field of config.fields || []) payload[field.key] = values[field.key] ?? field.fallback ?? "";
    for (const list of config.lists || []) payload[list.key] = values[list.key] ?? list.defaults;
    if (section === "contact") payload.socialLinks = String(values.socialLinks || "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    if (section === "footer") payload.footerSocialLinks = String(values.footerSocialLinks || "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    try { await admin.settings.save(payload); notifyContentUpdated(); setSuccess("Changes saved and published."); }
    catch (err) { setError(err.response?.data?.message || "Could not save changes."); }
    finally { setSaving(false); }
  };

  if (loading) return <Card className="p-7 max-w-4xl"><div className="h-24 animate-pulse rounded-xl bg-white/5"/></Card>;
  return <>
    <div className="mb-7"><div className="label mb-2">Website CMS</div><h1 className="text-3xl font-bold text-slate-100">{config.title}</h1><p className="text-slate-500 mt-1 text-sm">{config.description}</p></div>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
    {success && <p role="status" className="mb-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-200">{success}</p>}
    <form onSubmit={save} className="grid gap-5 max-w-4xl">
      {(config.fields || []).length > 0 && <Card className="p-6 grid gap-4">{section === "homepage" && <h2 className="text-xl font-semibold">Hero & homepage settings</h2>}{(config.fields || []).map((field) => <label key={field.key} className="grid gap-1 text-xs font-medium text-slate-400">{field.label}
        {field.image ? <ImageUploader value={values[field.key] || ""} onChange={(url) => setValue(field.key, url)} previewHeight="h-44" hint="Use the existing Cloudinary uploader. Save to publish."/> : field.checkbox ? <span className="flex items-center gap-2 rounded-xl border border-white/10 p-3 text-sm text-slate-300"><input type="checkbox" checked={(values[field.key] ?? field.fallback) !== false} onChange={(e) => setValue(field.key, e.target.checked)}/> Visible on the public website</span> : field.type === "select" ? <select className="input" value={values[field.key] ?? field.fallback ?? ""} onChange={(e) => setValue(field.key, e.target.value)}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.textarea ? <textarea className="input" rows={field.key === "homeHeroTitle" ? 3 : 4} value={values[field.key] ?? field.fallback ?? ""} onChange={(e) => setValue(field.key, e.target.value)} maxLength={5000} placeholder={field.lines ? "One https:// social profile URL per line" : undefined}/> : <input className="input" type={field.url ? "url" : "text"} value={values[field.key] ?? field.fallback ?? ""} onChange={(e) => setValue(field.key, e.target.value)} maxLength={5000}/>}
      </label>)}</Card>}
      {(config.lists || []).map((list) => <Card key={list.key} className="p-6 grid gap-4"><h2 className="text-xl font-semibold">{list.label}</h2><ListEditor config={list} value={values[list.key]} onChange={(value) => setValue(list.key, value)}/></Card>)}
      <button type="submit" className="primary justify-center max-w-4xl" disabled={saving}>{saving ? "Saving..." : "Save & Publish"}<Save size={15}/></button>
    </form>
  </>;
}
