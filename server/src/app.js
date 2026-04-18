import cors from "cors";
import express from "express";
import appRoutes from "./routes/appRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
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
