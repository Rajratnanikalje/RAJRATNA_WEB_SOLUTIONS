import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`${key} is missing`);
}
const app = express();
const allowed = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((x) => x.trim());
app.use(
  cors({
    origin: (o, cb) =>
      !o || allowed.includes(o)
        ? cb(null, true)
        : cb(new Error("CORS blocked")),
  }),
);
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (q, s) => s.json({ ok: true }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API on ${port}`)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
