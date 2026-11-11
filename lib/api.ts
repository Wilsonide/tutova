import type { ApiError, User } from "@/lib/types";
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
const API_PREFIX = "/api/v1";
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
export function apiUrl(path: string) {
  return `${API_BASE}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        accessToken = null;
        return null;
      }
      const data = await res.json();
      accessToken = data.access_token;
      return accessToken;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}
export async function api<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retry?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  if (options.auth !== false && accessToken)
    headers.set("Authorization", `Bearer ${accessToken}`);
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach Tutova API at ${API_BASE}. Check that FastAPI is running and CORS allows this app.`,
    );
  }
  if (res.status === 401 && options.auth !== false && options.retry !== false) {
    const token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(apiUrl(path), {
        ...init,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiError;
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail))
        detail =
          body.detail
            .map((e) => e.msg)
            .filter(Boolean)
            .join(" · ") || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  const raw = await res.text();
  return (raw ? JSON.parse(raw) : undefined) as T;
}
export async function establishSession(): Promise<User | null> {
  const token = await refreshAccessToken();
  if (!token) return null;
  try {
    return await api<User>("/auth/me");
  } catch {
    accessToken = null;
    return null;
  }
}
export async function login(email: string, password: string) {
  const result = await api<{ access_token: string }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { auth: false, retry: false },
  );
  accessToken = result.access_token;
  return api<User>("/auth/me");
}
export async function logout() {
  try {
    await api(
      "/auth/logout",
      { method: "POST", headers: {} },
      { retry: false },
    );
  } finally {
    accessToken = null;
  }
}
export function money(amountMinor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
