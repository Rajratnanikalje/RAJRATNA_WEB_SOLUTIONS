export const DEFAULT_WHATSAPP_MESSAGE = `Hello Rajratna Web Solutions! 👋

I came across your website and would like to discuss my project requirements.

Please let me know how we can get started.

Thank you!`;

export function withWhatsAppMessage(value) {
  if (!value) return "";

  const input = String(value).trim();
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://wa.me/${input.replace(/\D/g, "")}`);
  } catch {
    return "";
  }

  url.searchParams.set("text", DEFAULT_WHATSAPP_MESSAGE);
  return url.toString();
}
