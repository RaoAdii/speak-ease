const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "speak_ease_token";
export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearStoredToken() {
    localStorage.removeItem(TOKEN_KEY);
}
async function request(path, options = {}) {
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
    return data;
}
export const api = {
    login: (payload) => request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false
    }),
    register: (payload) => request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false
    }),
    me: () => request("/auth/me"),
    getCoursesPage: () => request("/app/courses"),
    selectCourse: (courseId) => request("/app/courses/select", {
        method: "POST",
        body: JSON.stringify({ courseId })
    }),
    getLearnPage: () => request("/app/learn"),
    getLessonPage: (lessonId) => request(lessonId ? `/app/lesson/${lessonId}` : "/app/lesson"),
    getQuizPage: () => request("/app/quiz"),
    getQuizSession: (lessonId, options = {}) => {
        const params = new URLSearchParams();
        if (options.type)
            params.set("type", options.type);
        if (options.courseId)
            params.set("courseId", String(options.courseId));
        if (options.topic)
            params.set("topic", options.topic);
        if (options.n)
            params.set("n", String(options.n));
        const query = params.toString() ? `?${params.toString()}` : "";
        return request(`/app/quiz/${lessonId}${query}`);
    },
    getLeaderboardPage: () => request("/app/leaderboard"),
    getQuestsPage: () => request("/app/quests"),
    getShopPage: () => request("/app/shop"),
    completeChallenge: (challengeId) => request(`/app/challenges/${challengeId}/complete`, {
        method: "POST"
    }),
    failChallenge: (challengeId) => request(`/app/challenges/${challengeId}/fail`, {
        method: "POST"
    }),
    refillHearts: () => request("/app/hearts/refill", {
        method: "POST"
    })
};
