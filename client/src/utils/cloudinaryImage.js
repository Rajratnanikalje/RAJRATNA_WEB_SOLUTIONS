const WIDTHS = [480, 800, 1200, 1920];

function cloudinaryUrl(url, width) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !parsed.pathname.includes("/image/upload/") ||
      /\/s--[^/]+--\//.test(parsed.pathname)
    ) return null;
    parsed.pathname = parsed.pathname.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto,w_${width}/`,
    );
    return parsed.href;
  } catch {
    return null;
  }
}

export function responsiveCloudinaryImage(url, widths = WIDTHS) {
  const candidates = widths
    .map((width) => ({ width, url: cloudinaryUrl(url, width) }))
    .filter((candidate) => candidate.url);
  return candidates.length
    ? { srcSet: candidates.map(({ width, url }) => `${url} ${width}w`).join(", ") }
    : {};
}
