export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(e, req, res, next) {
  console.error(e);
  if (res.headersSent) return next(e);
  if (e.code === 11000)
    return res.status(409).json({ message: "Duplicate value" });
  if (e.name === "ValidationError")
    return res.status(422).json({
      message: Object.values(e.errors)
        .map((x) => x.message)
        .join(", "),
    });
  const status = e.statusCode || 500;
  res
    .status(status)
    .json({
      message:
        status >= 500 && process.env.NODE_ENV === "production"
          ? "Internal server error"
          : e.message || "Internal server error",
    });
}
