// Thin fetch wrapper: adds base URL, JSON headers, auth header, error handling.

async function apiFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError("You need to be logged in.", 401);
    }
    headers["Authorization"] = "Bearer " + token;
  } else {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token; // optional auth (e.g. liked_by_me)
  }

  let res;
  try {
    res = await fetch(getApiBaseUrl() + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Could not reach the API at " + getApiBaseUrl() + ". Check the API URL (gear icon) and that the backend is running.",
      0
    );
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no body
  }

  if (!res.ok) {
    if (res.status === 401) clearAuth();
    throw new ApiError((data && data.error) || res.statusText, res.status);
  }

  return data;
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function qs(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, v);
  });
  const s = usp.toString();
  return s ? "?" + s : "";
}
