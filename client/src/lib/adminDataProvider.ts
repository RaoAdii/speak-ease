import simpleRestProvider from "ra-data-simple-rest";
import { fetchUtils } from "react-admin";
import { getStoredToken } from "./api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || { Accept: "application/json" });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  options.headers = headers;
  return fetchUtils.fetchJson(url, options);
};

export const adminDataProvider = simpleRestProvider(
  `${API_URL}/admin`,
  httpClient
);
