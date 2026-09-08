// JWT/auth helpers. Token + user are cached in localStorage.

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

function getToken() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  return token;
}

function getCurrentUser() {
  if (!getToken()) return null;
  const raw = localStorage.getItem("auth_user");
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function setAuth(token, user) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

function requireLoginRedirect() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return true;
  }
  return false;
}
