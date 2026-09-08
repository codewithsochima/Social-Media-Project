// Runtime-configurable API base URL, so this static frontend can point at
// whatever backend host you run (localhost while developing, a deployed URL later).
const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  return localStorage.getItem("api_base_url") || DEFAULT_API_BASE_URL;
}

function setApiBaseUrl(url) {
  localStorage.setItem("api_base_url", url.replace(/\/+$/, ""));
}
