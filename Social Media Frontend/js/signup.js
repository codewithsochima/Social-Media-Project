document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("signup");
  if (isLoggedIn()) window.location.href = "index.html";

  document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("form-error");
    const btn = document.getElementById("submit-btn");
    errEl.style.display = "none";
    btn.disabled = true;

    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: {
          first_name: document.getElementById("first_name").value.trim(),
          last_name: document.getElementById("last_name").value.trim(),
          username: document.getElementById("username").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        },
      });

      // auto-login after signup
      const loginRes = await apiFetch("/auth/login", {
        method: "POST",
        body: {
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        },
      });
      setAuth(loginRes.token, loginRes.user);
      window.location.href = "index.html";
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = "block";
    } finally {
      btn.disabled = false;
    }
  });
});
