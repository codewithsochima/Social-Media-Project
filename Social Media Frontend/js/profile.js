function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

let profileState = {
  userId: null,
  isOwner: false,
  postsPage: 1,
  postState: "",
  followingPage: 1,
  followersPage: 1,
  activeTab: "posts",
};

async function initProfile() {
  let userId = getParam("id");
  const me = getCurrentUser();

  if (!userId) {
    if (!me) {
      window.location.href = "login.html";
      return;
    }
    userId = me.id;
  }

  profileState.userId = userId;
  profileState.isOwner = !!me && me.id === userId;

  await loadProfileHeader();
  setupTabs();
  loadPosts();
}

async function loadProfileHeader() {
  const root = document.getElementById("profile-header");
  try {
    const user = await apiFetch(`/users/${encodeURIComponent(profileState.userId)}`);
    const initials = ((user.first_name || "?")[0] + (user.last_name || "")[0]).toUpperCase();

    root.innerHTML = `
      <div class="card">
        <div class="author-box" style="border-bottom:none; margin-bottom: 8px;">
          <div class="avatar">${escapeHtml(initials)}</div>
          <div>
            <h1 style="margin:0;">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</h1>
            <div class="post-meta">@${escapeHtml(user.username)}</div>
          </div>
        </div>
        <div class="stat-row" style="margin-bottom: 10px;">
          <span>${user.following_count ?? 0} following</span>
          <span>${user.followers_count ?? 0} followers</span>
        </div>
        <div id="follow-action"></div>
        <p id="follow-msg"></p>
      </div>
    `;

    const followActionEl = document.getElementById("follow-action");
    if (!profileState.isOwner) {
      if (!isLoggedIn()) {
        followActionEl.innerHTML = `<a class="btn secondary" href="login.html">Log in to follow</a>`;
      } else {
        renderFollowButton(user.is_following);
      }
    }

    document.getElementById("tabs").style.display = "flex";
    document.getElementById("state-filter-row").style.display = profileState.isOwner ? "flex" : "none";
    if (profileState.isOwner) {
      document.getElementById("state-filter").addEventListener("change", (e) => {
        profileState.postState = e.target.value;
        profileState.postsPage = 1;
        loadPosts();
      });
    }
  } catch (err) {
    root.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderFollowButton(isFollowing) {
  const el = document.getElementById("follow-action");
  el.innerHTML = `<button id="follow-btn" class="${isFollowing ? "secondary" : ""}">${
    isFollowing ? "Unfollow" : "Follow"
  }</button>`;
  document.getElementById("follow-btn").addEventListener("click", async () => {
    const btn = document.getElementById("follow-btn");
    const msg = document.getElementById("follow-msg");
    btn.disabled = true;
    msg.textContent = "";
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await apiFetch(`/users/${profileState.userId}/follow`, { method, auth: true });
      renderFollowButton(res.following);
      loadProfileHeader(); // refresh counts
    } catch (err) {
      msg.className = "error";
      msg.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
}

function setupTabs() {
  document.querySelectorAll("#tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      profileState.activeTab = tab;
      document.getElementById("posts-tab").style.display = tab === "posts" ? "block" : "none";
      document.getElementById("following-tab").style.display = tab === "following" ? "block" : "none";
      document.getElementById("followers-tab").style.display = tab === "followers" ? "block" : "none";
      if (tab === "following") loadFollowing();
      if (tab === "followers") loadFollowers();
    });
  });
}

async function loadPosts() {
  const listEl = document.getElementById("posts-list");
  listEl.innerHTML = `<p class="notice">Loading...</p>`;
  try {
    const res = await apiFetch(
      `/users/${profileState.userId}/posts` +
        qs({
          page: profileState.postsPage,
          limit: 10,
          state: profileState.isOwner ? profileState.postState : "published",
        })
    );
    const posts = res.data || [];
    listEl.innerHTML = posts.length
      ? posts.map(renderProfilePostCard).join("")
      : `<p class="notice">No posts yet.</p>`;
    renderSimplePagination(
      "posts-pagination",
      res.page || 1,
      res.totalPages || 1,
      (p) => {
        profileState.postsPage = p;
        loadPosts();
      }
    );
  } catch (err) {
    listEl.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderProfilePostCard(post) {
  const tags = (post.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  return `
    <a class="card post-card" href="post.html?id=${encodeURIComponent(post.id)}">
      <span class="state-badge state-${post.state}">${escapeHtml(post.state)}</span>
      <h2 class="post-title">${escapeHtml(post.title)}</h2>
      <div class="post-meta">${formatDate(post.timestamp)}</div>
      <div>${tags}</div>
      <div class="stat-row"><span>❤ ${post.like_count ?? 0}</span><span>💬 ${post.comment_count ?? 0}</span></div>
    </a>
  `;
}

async function loadFollowing() {
  const listEl = document.getElementById("following-list");
  listEl.innerHTML = `<p class="notice">Loading...</p>`;
  try {
    const res = await apiFetch(`/users/${profileState.userId}/following` + qs({ page: profileState.followingPage, limit: 20 }));
    renderUserList(listEl, res.data || []);
    renderSimplePagination("following-pagination", res.page || 1, res.totalPages || 1, (p) => {
      profileState.followingPage = p;
      loadFollowing();
    });
  } catch (err) {
    listEl.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

async function loadFollowers() {
  const listEl = document.getElementById("followers-list");
  listEl.innerHTML = `<p class="notice">Loading...</p>`;
  try {
    const res = await apiFetch(`/users/${profileState.userId}/followers` + qs({ page: profileState.followersPage, limit: 20 }));
    renderUserList(listEl, res.data || []);
    renderSimplePagination("followers-pagination", res.page || 1, res.totalPages || 1, (p) => {
      profileState.followersPage = p;
      loadFollowers();
    });
  } catch (err) {
    listEl.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderUserList(container, users) {
  if (!users.length) {
    container.innerHTML = `<p class="notice">Nobody here yet.</p>`;
    return;
  }
  container.innerHTML = `<div class="card">${users
    .map(
      (u) => `
    <div class="user-row">
      <a href="profile.html?id=${u.id}">${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)} <span class="post-meta">@${escapeHtml(
        u.username
      )}</span></a>
    </div>
  `
    )
    .join("")}</div>`;
}

function renderSimplePagination(elId, page, totalPages, onChange) {
  const el = document.getElementById(elId);
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <button ${page <= 1 ? "disabled" : ""} id="${elId}-prev">Prev</button>
    <span class="current">Page ${page} of ${totalPages}</span>
    <button ${page >= totalPages ? "disabled" : ""} id="${elId}-next">Next</button>
  `;
  const prev = document.getElementById(`${elId}-prev`);
  const next = document.getElementById(`${elId}-next`);
  if (prev) prev.addEventListener("click", () => onChange(page - 1));
  if (next) next.addEventListener("click", () => onChange(page + 1));
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("profile");
  initProfile();
});
