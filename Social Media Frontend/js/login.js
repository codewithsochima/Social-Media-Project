document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("login");
  if (isLoggedIn()) window.location.href = "index.html";

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("form-error");
    const btn = document.getElementById("submit-btn");
    errEl.style.display = "none";
    btn.disabled = true;

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: {
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        },
      });
      setAuth(res.token, res.user);
      window.location.href = "index.html";
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = "block";
    } finally {
      btn.disabled = false;
    }
  });
});
