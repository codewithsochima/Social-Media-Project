const DEFAULT_API_BASE_URL = "https://social-media-project-1-vycd.onrender.com/api";
function getApiBaseUrl() {
  return localStorage.getItem("api_base_url") || DEFAULT_API_BASE_URL;
}

function setApiBaseUrl(url) {
  localStorage.setItem("api_base_url", url.replace(/\/+$/, ""));
}
