function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function initialsOf(user) {
  if (!user) return "?";
  return ((user.first_name || "?")[0] + (user.last_name || "")[0]).toUpperCase();
}

function renderSidebar(activePage) {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  const user = getCurrentUser();

  const navItem = (page, href, icon, label) =>
    `<a href="${href}" class="${activePage === page ? "active" : ""}">
       <span><span class="nav-icon">${icon}</span> ${label}</span>
     </a>`;

  root.innerHTML = `
    <div class="sidebar">
      <div class="profile-card">
        ${
          user
            ? `<div class="profile-avatar-lg">${escapeHtml(initialsOf(user))}</div>
               <div class="profile-name">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</div>
               <div class="profile-handle">@${escapeHtml(user.username)}</div>`
            : `<div class="profile-avatar-lg">?</div>
               <div class="profile-name">Guest</div>
               <div class="profile-handle">Not logged in</div>`
        }
      </div>

      <nav class="nav-list">
        ${navItem("feed", "index.html", "🏠", "Feed")}
        ${user ? navItem("create", "create-post.html", "✎", "New Post") : ""}
        ${user ? navItem("profile", `profile.html?id=${user.id}`, "👤", "My Profile") : ""}
        ${
          user
            ? `<button id="logout-btn"><span><span class="nav-icon">↪</span> Log out</span></button>`
            : `${navItem("login", "login.html", "🔑", "Log in")}${navItem("signup", "signup.html", "✨", "Sign up")}`
        }
      </nav>

      <div class="download-card">
        Plain HTML · CSS · JS<br />No framework, no build step.
      </div>

      <div class="settings-inline">
        <button id="settings-btn">⚙ API settings</button>
      </div>
    </div>

    <dialog id="settings-dialog">
      <form method="dialog" id="settings-form">
        <h3>API settings</h3>
        <label>Backend API base URL
          <input type="text" id="api-url-input" placeholder="http://localhost:5000/api" />
        </label>
        <div class="dialog-actions">
          <button type="button" id="settings-cancel" class="secondary">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </dialog>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }

  const dialog = document.getElementById("settings-dialog");
  document.getElementById("settings-btn").addEventListener("click", () => {
    document.getElementById("api-url-input").value = getApiBaseUrl();
    dialog.showModal();
  });
  document.getElementById("settings-cancel").addEventListener("click", () => dialog.close());
  document.getElementById("settings-form").addEventListener("submit", () => {
    const val = document.getElementById("api-url-input").value.trim();
    if (val) setApiBaseUrl(val);
  });
}
