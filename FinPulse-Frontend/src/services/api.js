const BASE_URL = "https://finpulse-backend-7h89.onrender.com/api";
// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken   = ()  => localStorage.getItem("fp_token");
export const getUser    = ()  => { try { return JSON.parse(localStorage.getItem("fp_user")); } catch { return null; } };
export const saveToken  = (t) => localStorage.setItem("fp_token", t);
export const saveUser   = (u) => localStorage.setItem("fp_user", JSON.stringify(u));
export const clearAuth  = ()  => { localStorage.removeItem("fp_token"); localStorage.removeItem("fp_user"); };
export const isLoggedIn = ()  => !!getToken();

// ── Core fetch ────────────────────────────────────────────────────────────────
async function request(method, path, body) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) { clearAuth(); window.location.href = "/login"; return; }
  if (!res.ok) { const msg = await res.text(); throw new Error(msg || `HTTP ${res.status}`); }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  const data = await res.json();
  saveToken(data.token);
  saveUser({ name: data.name, email: data.email });
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) { const msg = await res.text(); throw new Error(msg || "Registration failed"); }
  const data = await res.json();
  saveToken(data.token);
  saveUser({ name: data.name, email: data.email });
  return data;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export const api = {
  get:    (path)       => request("GET",    path),
  post:   (path, body) => request("POST",   path, body),
  put:    (path, body) => request("PUT",    path, body),
  patch:  (path, body) => request("PATCH",  path, body),
  delete: (path)       => request("DELETE", path),
};
