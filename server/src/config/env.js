import dotenv from "dotenv";

dotenv.config();

function splitCsv(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lingo",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  adminEmails: splitCsv(process.env.ADMIN_EMAILS)
};
