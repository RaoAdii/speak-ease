import { env } from "../config/env.js";

export function isAdminEmail(email) {
  return env.adminEmails.includes((email || "").trim().toLowerCase());
}
