function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadPost() {
  const root = document.getElementById("post-root");
  const id = getParam("id");
  if (!id) {
    root.innerHTML = `<p class="error">No post id given.</p>`;
    return;
  }

  try {
    const post = await apiFetch(`/posts/${encodeURIComponent(id)}`);
    renderPost(post);
  } catch (err) {
    root.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderPost(post) {
  const root = document.getElementById("post-root");
  const me = getCurrentUser();
  const isOwner = !!me && post.author && me.id === post.author.id;
  const tags = (post.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const initials = post.author
    ? ((post.author.first_name || "?")[0] + (post.author.last_name || "")[0]).toUpperCase()
    : "?";

  root.innerHTML = `
    <div class="card">
      <div class="author-box">
        <div class="avatar">${escapeHtml(initials)}</div>
        <div>
          <a href="profile.html?id=${post.author ? post.author.id : ""}">
            ${escapeHtml(post.author ? `${post.author.first_name} ${post.author.last_name}` : "Unknown")}
          </a>
          <div class="post-meta">@${escapeHtml(post.author ? post.author.username : "")} · ${formatDate(post.timestamp)}</div>
        </div>
      </div>

      <span class="state-badge state-${post.state}">${escapeHtml(post.state)}</span>
      <h1>${escapeHtml(post.title)}</h1>
      <div>${tags}</div>
      <p style="white-space: pre-wrap;">${escapeHtml(post.content)}</p>

      <div class="btn-row" style="margin-top: 16px;">
        <button id="like-btn" class="like-btn ${post.liked_by_me ? "liked" : ""}">
          ❤ <span id="like-count">${post.like_count ?? 0}</span>
        </button>
        <span class="post-meta" style="align-self: center;">💬 ${post.comment_count ?? 0} comments</span>
      </div>

      ${
        isOwner
          ? `
        <div class="btn-row" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
          <a class="btn secondary" href="edit-post.html?id=${post.id}">Edit</a>
          ${
            post.state === "draft"
              ? `<button id="publish-btn" class="secondary">Publish</button>`
              : `<button id="unpublish-btn" class="secondary">Move to draft</button>`
          }
          <button id="delete-btn" class="danger">Delete</button>
        </div>
        <p id="owner-msg"></p>
      `
          : ""
      }
      <p id="like-msg"></p>
    </div>
  `;

  document.getElementById("like-btn").addEventListener("click", () => toggleLike(post));

  if (isOwner) {
    const publishBtn = document.getElementById("publish-btn");
    const unpublishBtn = document.getElementById("unpublish-btn");
    if (publishBtn) publishBtn.addEventListener("click", () => setState(post.id, "published"));
    if (unpublishBtn) unpublishBtn.addEventListener("click", () => setState(post.id, "draft"));
    document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
  }
}

async function toggleLike(post) {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  const btn = document.getElementById("like-btn");
  const countEl = document.getElementById("like-count");
  const msg = document.getElementById("like-msg");
  btn.disabled = true;
  try {
    const method = post.liked_by_me ? "DELETE" : "POST";
    const res = await apiFetch(`/posts/${post.id}/like`, { method, auth: true });
    post.liked_by_me = res.liked;
    countEl.textContent = res.like_count;
    btn.classList.toggle("liked", res.liked);
    msg.textContent = "";
  } catch (err) {
    msg.className = "error";
    msg.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

async function setState(id, state) {
  const msg = document.getElementById("owner-msg");
  try {
    await apiFetch(`/posts/${id}`, { method: "PATCH", auth: true, body: { state } });
    loadPost();
  } catch (err) {
    msg.className = "error";
    msg.textContent = err.message;
  }
}

async function deletePost(id) {
  if (!confirm("Delete this post? This cannot be undone.")) return;
  const msg = document.getElementById("owner-msg");
  try {
    await apiFetch(`/posts/${id}`, { method: "DELETE", auth: true });
    window.location.href = "index.html";
  } catch (err) {
    msg.className = "error";
    msg.textContent = err.message;
  }
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("feed");
  loadPost();
});
