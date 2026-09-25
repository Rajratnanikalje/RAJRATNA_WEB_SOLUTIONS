/**
 * Small in-memory limiter for public endpoints. For multi-instance production
 * deployments, replace this store with Redis or a platform edge limiter.
 */
export function rateLimit({ windowMs, max, key = (req) => req.ip }) {
  const hits = new Map();
  let lastSweep = 0;

  return (req, res, next) => {
    const now = Date.now();
    // Prevent expired IP entries from accumulating forever.
    if (now - lastSweep >= windowMs) {
      for (const [storedKey, stored] of hits) {
        if (now >= stored.resetAt) hits.delete(storedKey);
      }
      lastSweep = now;
    }
    const client = key(req) || "unknown";
    const entry = hits.get(client);
    const current =
      !entry || now >= entry.resetAt
        ? { count: 1, resetAt: now + windowMs }
        : { ...entry, count: entry.count + 1 };

    hits.set(client, current);
    res.set("RateLimit-Policy", `${max};w=${Math.ceil(windowMs / 1000)}`);
    res.set("RateLimit-Remaining", String(Math.max(0, max - current.count)));

    if (current.count > max) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again shortly." });
    }
    next();
  };
}
