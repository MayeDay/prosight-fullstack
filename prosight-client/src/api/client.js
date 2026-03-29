// src/api/client.js
// Central API client. All backend calls go through here.
// Automatically attaches the JWT token from localStorage.

const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("prosight_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body)    => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  me: ()           => request("/users/me"),
};

// ── Projects ──────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: (status) =>
    request(`/projects${status ? `?status=${status}` : ""}`),
  getMine: ()           => request("/projects/mine"),
  getById: (id)         => request(`/projects/${id}`),
  create: (body)        => request("/projects", { method: "POST", body: JSON.stringify(body) }),
  apply: (id)           => request(`/projects/${id}/apply`, { method: "POST" }),
  getApplications: (id) => request(`/projects/${id}/applications`),
  accept: (id, proId)   => request(`/projects/${id}/accept/${proId}`, { method: "POST" }),
  complete: (id)        => request(`/projects/${id}/complete`, { method: "POST" }),
};

// ── Messages ──────────────────────────────────────────────────────────────
export const messagesApi = {
  getAll: (projectId)        => request(`/projects/${projectId}/messages`),
  send: (projectId, text)    =>
    request(`/projects/${projectId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};

// ── Users / Pros ──────────────────────────────────────────────────────────
export const usersApi = {
  getPros:       ()    => request("/users/pros"),
  getProProfile: (id)  => request(`/users/pros/${id}`),
  getMe:         ()    => request("/users/me"),
  updateMe:      (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
};

// ── Reviews ───────────────────────────────────────────────────────────────
export const reviewsApi = {
  getForPro: (proId) => request(`/reviews/pro/${proId}`),
  create: (body)     => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
};
