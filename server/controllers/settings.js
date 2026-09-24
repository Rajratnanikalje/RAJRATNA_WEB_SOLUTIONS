import Settings from "../models/Settings.js";

const fields = [
  "siteTitle", "logoUrl", "faviconUrl", "brandPrimaryText", "brandSecondaryText",
  "navbarItems", "navbarCtaText", "navbarCtaRouteKey", "navbarCtaVisible",
  "footerLogoUrl", "footerDescription", "footerQuickLinksHeading", "footerQuickLinks",
  "footerServicesHeading", "footerServiceLinks", "footerContactHeading", "footerPhone", "footerEmail", "footerWhatsapp", "footerLocation", "footerSocialLinks", "footerBrandVisible",
  "footerQuickLinksVisible", "footerServicesVisible", "footerContactVisible", "footerSocialVisible",
  "footerCopyrightText", "footerTagline", "footerPrivacyLabel", "footerTermsLabel", "footerWhatsappLabel",
  "footerShowPhone", "footerShowEmail", "footerShowWhatsapp", "footerShowLocation",
  "heroImageUrl", "homeHeroEyebrow", "homeHeroTitle", "homeHeroSecondaryTitle", "homeHeroThirdTitle",
  "homeHeroSubtitle", "homeHeroDescription", "homeHeroCtaText", "homeHeroCtaUrl", "homeHeroCtaRouteKey", "heroVisible",
  "heroCtaVisible", "homeHeroVerticalWords", "homeHeroVerticalVisible", "aboutVisible", "servicesVisible",
  "projectsVisible", "technologiesVisible", "whyVisible", "processVisible", "faqVisible",
  "testimonialsVisible", "finalCtaVisible", "homeAboutEyebrow", "homeAboutTitle", "homeAboutDescription",
  "homeAboutCtaText", "homeAboutCtaRouteKey", "homeServicesEyebrow", "homeServicesTitle", "homeServicesDescription", "homeServicesCtaText", "homeServicesCtaRouteKey",
  "homeProjectsEyebrow", "homeProjectsTitle", "homeProjectsDescription", "homeProjectsCtaText", "homeProjectsCtaRouteKey",
  "homeTechnologiesEyebrow", "homeTechnologiesTitle", "homeTechnologiesDescription", "homeWhyEyebrow",
  "whyItems", "whyTitle", "whyDescription", "processSteps", "processTitle", "processDescription", "processEyebrow",
  "processPageVisible", "processCtaText", "processCtaRouteKey", "faqItems", "homeFaqEyebrow", "homeFaqTitle",
  "homeFaqDescription", "homeTestimonialsEyebrow", "homeTestimonialsTitle", "homeTestimonialsDescription", "testimonials", "finalCtaTitle", "finalCtaEyebrow", "finalCtaDescription", "finalCtaButtonText", "finalCtaButtonRouteKey", "finalCtaWhatsappText",
  "aboutImageUrl", "aboutPageVisible", "aboutEyebrow", "aboutTitle", "aboutDescription", "aboutPrimaryCtaText",
  "aboutPrimaryCtaRouteKey", "aboutSecondaryCtaText", "aboutSecondaryCtaRouteKey", "aboutTechVisible",
  "aboutTechEyebrow", "aboutTechTitle", "aboutTechDescription", "aboutHighlights",
  "servicesPageEyebrow", "servicesPageVisible", "servicesPageTitle", "servicesPageDescription", "servicesCtaText",
  "servicesCtaRouteKey", "serviceCardCtaText", "serviceCardCtaRouteKey", "portfolioPageEyebrow", "portfolioPageVisible",
  "portfolioPageTitle", "portfolioPageDescription", "projectDemoLabel", "projectGithubLabel", "projectDetailsLabel",
  "technologiesPageEyebrow", "technologiesPageVisible", "technologiesPageTitle", "technologiesPageDescription",
  "contactPageVisible", "contactEyebrow", "contactTitle", "contactDescription", "contactPhoneLabel", "contactEmailLabel",
  "contactLocationLabel", "contactWhatsappLabel", "contactSocialLabel", "contactNameLabel", "contactNamePlaceholder", "contactEmailFieldLabel", "contactEmailPlaceholder",
  "contactPhoneFieldLabel", "contactPhonePlaceholder", "contactCompanyLabel", "contactCompanyPlaceholder", "contactServiceLabel", "contactOtherServiceLabel", "contactServicePlaceholder",
  "contactBudgetLabel", "contactOptionalLabel", "contactBudgetPlaceholder", "contactMessageLabel", "contactMessagePlaceholder", "contactSubmitLabel",
  "contactSendingLabel", "contactSuccessMessage", "contactWhatsappUrl", "phone", "whatsapp", "email", "location", "socialLinks",
  "privacyTitle", "privacyEyebrow", "privacyIntro", "privacySections", "termsTitle", "termsEyebrow", "termsIntro", "termsSections",
  "seoTitle", "seoDescription", "ogTitle", "ogDescription", "ogImage", "pageSeo",
];

const listFields = ["navbarItems", "footerQuickLinks", "footerServiceLinks", "homeHeroVerticalWords", "aboutHighlights", "whyItems", "processSteps", "faqItems", "testimonials", "privacySections", "termsSections", "pageSeo"];
const routeKeys = new Set(["home", "about", "services", "projects", "technologies", "process", "contact", "privacy", "terms"]);
const urlFields = ["logoUrl", "faviconUrl", "heroImageUrl", "aboutImageUrl", "footerLogoUrl", "ogImage", "contactWhatsappUrl"];
const routesFields = ["navbarCtaRouteKey", "homeHeroCtaRouteKey", "homeAboutCtaRouteKey", "homeServicesCtaRouteKey", "homeProjectsCtaRouteKey", "aboutPrimaryCtaRouteKey", "aboutSecondaryCtaRouteKey", "processCtaRouteKey", "finalCtaButtonRouteKey", "servicesCtaRouteKey", "serviceCardCtaRouteKey"];
const requiredFields = {
  navbarItems: ["label", "routeKey"], footerQuickLinks: ["label", "routeKey"], footerServiceLinks: ["label"],
  homeHeroVerticalWords: ["label"], aboutHighlights: ["title", "description"], whyItems: ["title", "description"],
  processSteps: ["title", "description"], faqItems: ["question", "answer"], testimonials: ["clientName", "testimonial"],
  privacySections: ["title", "description"], termsSections: ["title", "description"],
};

const pick = (body) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

export async function pub(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({ data: await Settings.findOne() });
}

export async function get(req, res) {
  res.set("Cache-Control", "no-store");
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ data: settings });
}

export async function save(req, res) {
  const data = pick(req.body);
  for (const key of listFields) {
    if (data[key] !== undefined && !Array.isArray(data[key])) return res.status(422).json({ message: `${key} must be a list` });
    if ((data[key]?.length || 0) > 100) return res.status(422).json({ message: `${key} has too many entries` });
    for (const item of data[key] || []) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return res.status(422).json({ message: `${key} contains an invalid entry` });
      for (const [field, value] of Object.entries(item)) {
        if (typeof value === "string" && value.length > 5000) return res.status(422).json({ message: `${key}.${field} is too long` });
      }
      const required = requiredFields[key] || [];
      const shown = item.visible !== false && item.active !== false;
      if (shown && required.some((field) => !String(item[field] || "").trim())) return res.status(422).json({ message: `${key} visible items need ${required.join(" and ")}` });
      if (item.displayOrder !== undefined && (!Number.isFinite(Number(item.displayOrder)) || Number(item.displayOrder) < 0)) return res.status(422).json({ message: `${key} display order must be non-negative` });
      if (item.routeKey && !routeKeys.has(item.routeKey)) return res.status(422).json({ message: `${key} must use an existing public route` });
      if (key === "pageSeo" && item.pageKey && !routeKeys.has(item.pageKey)) return res.status(422).json({ message: "SEO entries must use an existing public page" });
      if (key === "pageSeo" && item.twitterCard && !["summary", "summary_large_image"].includes(item.twitterCard)) return res.status(422).json({ message: "Twitter card must use a supported value" });
      for (const imageKey of ["imageUrl", "profileImageUrl"]) if (item[imageKey] && !/^https?:\/\//i.test(item[imageKey])) return res.status(422).json({ message: `${key} image must be a valid http or https URL` });
      for (const urlKey of ["canonicalUrl", "ogImage", "twitterImage"]) if (item[urlKey] && !/^https?:\/\//i.test(item[urlKey])) return res.status(422).json({ message: `${key}.${urlKey} must be a valid http or https URL` });
    }
  }
  for (const key of fields) if (typeof data[key] === "string" && data[key].length > 20000) return res.status(422).json({ message: `${key} is too long` });
  for (const key of urlFields) if (data[key] && !/^https?:\/\//i.test(data[key])) return res.status(422).json({ message: `${key} must be a valid http or https URL` });
  for (const key of routesFields) if (data[key] && !routeKeys.has(data[key])) return res.status(422).json({ message: `${key} must use an existing public route` });
  if (data.homeHeroCtaUrl && !(data.homeHeroCtaUrl.startsWith("/") && !data.homeHeroCtaUrl.startsWith("//")) && !/^https?:\/\//i.test(data.homeHeroCtaUrl)) return res.status(422).json({ message: "Hero CTA URL must be a site path or valid http or https URL" });
  if (data.socialLinks !== undefined && (!Array.isArray(data.socialLinks) || data.socialLinks.some((url) => typeof url !== "string" || !/^https?:\/\//i.test(url)))) return res.status(422).json({ message: "Social links must be valid http or https URLs" });
  for (const key of ["socialLinks", "footerSocialLinks"]) if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].some((url) => typeof url !== "string" || !/^https?:\/\//i.test(url)))) return res.status(422).json({ message: `${key} must contain valid http or https URLs` });
  for (const key of ["socialLinks", "footerSocialLinks"]) if ((data[key]?.length || 0) > 100) return res.status(422).json({ message: `${key} has too many entries` });
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return res.status(422).json({ message: "Enter a valid contact email" });
  if (data.footerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.footerEmail)) return res.status(422).json({ message: "Enter a valid footer email" });
  if (data.whatsapp && !/^(?:\+?[\d\s().-]{7,20}|https?:\/\/\S+)$/i.test(data.whatsapp)) return res.status(422).json({ message: "Enter a valid WhatsApp number or URL" });

  res.set("Cache-Control", "no-store");
  let settings = await Settings.findOne();
  settings = settings ? await Settings.findByIdAndUpdate(settings._id, data, { new: true, runValidators: true }) : await Settings.create(data);
  res.json({ data: settings });
}
