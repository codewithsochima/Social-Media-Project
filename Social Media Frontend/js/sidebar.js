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
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }
}