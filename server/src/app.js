import cors from "cors";
import express from "express";
import appRoutes from "./routes/appRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

const configuredOrigins = (env.clientUrl || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
    exposedHeaders: ["Content-Range"]
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/app", requireAuth, appRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
