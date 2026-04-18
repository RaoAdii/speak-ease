import type {
  CoursesPageResponse,
  LeaderboardResponse,
  LearnPageResponse,
  LessonPageResponse,
  SimpleProgressResponse
} from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "speak_ease_token";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data as T;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false
    }),
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false
    }),
  me: () => request<{ user: unknown }>("/auth/me"),
  getCoursesPage: () => request<CoursesPageResponse>("/app/courses"),
  selectCourse: (courseId: number) =>
    request<{ ok: boolean }>("/app/courses/select", {
      method: "POST",
      body: JSON.stringify({ courseId })
    }),
  getLearnPage: () => request<LearnPageResponse>("/app/learn"),
  getLessonPage: (lessonId?: number) =>
    request<LessonPageResponse>(lessonId ? `/app/lesson/${lessonId}` : "/app/lesson"),
  getLeaderboardPage: () => request<LeaderboardResponse>("/app/leaderboard"),
  getQuestsPage: () => request<SimpleProgressResponse>("/app/quests"),
  getShopPage: () => request<SimpleProgressResponse>("/app/shop"),
  completeChallenge: (challengeId: number) =>
    request<{ error?: string; hearts?: number; points?: number }>(
      `/app/challenges/${challengeId}/complete`,
      {
        method: "POST"
      }
    ),
  failChallenge: (challengeId: number) =>
    request<{ error?: string; hearts?: number }>(
      `/app/challenges/${challengeId}/fail`,
      {
        method: "POST"
      }
    ),
  refillHearts: () =>
    request<{ userProgress: SimpleProgressResponse["userProgress"] }>(
      "/app/hearts/refill",
      {
        method: "POST"
      }
    )
};
