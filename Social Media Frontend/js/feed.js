let feedState = { page: 1, limit: 20, search: "", sort: "timestamp", order: "desc" };

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function renderComposer() {
  const root = document.getElementById("composer-root");
  const me = getCurrentUser();
  if (!me) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = `
    <div class="composer">
      <div class="avatar-sm">${escapeHtml(initialsOf(me))}</div>
      <a class="composer-input" href="create-post.html">Share something...</a>
    </div>
  `;
}

async function loadFeed() {
  const listEl = document.getElementById("posts-list");
  listEl.innerHTML = `<p class="notice">Loading...</p>`;

  try {
    const res = await apiFetch(
      "/posts" +
        qs({
          page: feedState.page,
          limit: feedState.limit,
          search: feedState.search,
          sort: feedState.sort,
          order: feedState.order,
        })
    );

    const posts = res.data || [];
    if (posts.length === 0) {
      listEl.innerHTML = `<p class="notice">No posts found.</p>`;
    } else {
      listEl.innerHTML = posts.map(renderPostCard).join("");
    }

    renderPagination(res.page || 1, res.totalPages || 1);
    updateTrendingTagsFallback(posts);
  } catch (err) {
    listEl.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
    document.getElementById("pagination").innerHTML = "";
  }
}

function renderPostCard(post) {
  const author = post.author
    ? `${escapeHtml(post.author.first_name || "")} ${escapeHtml(post.author.last_name || "")}`.trim() ||
      escapeHtml(post.author.username)
    : escapeHtml(post.author_username || "unknown");
  const initials = post.author
    ? ((post.author.first_name || "?")[0] + "").toUpperCase()
    : (post.author_username || "?")[0].toUpperCase();
  const tags = (post.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
  const excerpt = (post.content || "").slice(0, 220) + ((post.content || "").length > 220 ? "…" : "");

  return `
    <a class="post-card" href="post.html?id=${encodeURIComponent(post.id)}">
      <div class="author-row">
        <div class="avatar">${initials}</div>
        <div>
          <div class="author-name">${author}</div>
          <div class="post-meta">${formatDate(post.timestamp)}</div>
        </div>
      </div>
      <h2 class="post-title">${escapeHtml(post.title)}</h2>
      <p class="post-excerpt">${escapeHtml(excerpt)}</p>
      <div>${tags}</div>
      <div class="reaction-row">
        <span class="stat">❤ ${post.like_count ?? 0} likes</span>
        <span class="stat">💬 ${post.comment_count ?? 0} comments</span>
      </div>
    </a>
  `;
}

function renderPagination(page, totalPages) {
  const el = document.getElementById("pagination");
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }
  let html = `<button ${page <= 1 ? "disabled" : ""} id="prev-page">Prev</button>`;
  html += `<span class="current">Page ${page} of ${totalPages}</span>`;
  html += `<button ${page >= totalPages ? "disabled" : ""} id="next-page">Next</button>`;
  el.innerHTML = html;

  const prev = document.getElementById("prev-page");
  const next = document.getElementById("next-page");
  if (prev) prev.addEventListener("click", () => { feedState.page--; loadFeed(); window.scrollTo(0, 0); });
  if (next) next.addEventListener("click", () => { feedState.page++; loadFeed(); window.scrollTo(0, 0); });
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

async function loadSuggestions() {
  const el = document.getElementById("suggestions-list");
  const me = getCurrentUser();
  if (!me) {
    el.innerHTML = `<p class="notice">Log in to see suggestions.</p>`;
    return;
  }
  try {
    const users = await apiFetch("/users/suggestions" + qs({ limit: 5 }), { auth: true });
    if (!users || !users.length) {
      el.innerHTML = `<p class="notice">No suggestions right now.</p>`;
      return;
    }
    el.innerHTML = users
      .map(
        (u) => `
      <div class="suggestion-row">
        <div class="avatar">${escapeHtml(initialsOf(u))}</div>
        <div class="suggestion-info">
          <div class="suggestion-name">${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</div>
          <div class="suggestion-handle">@${escapeHtml(u.username)}</div>
        </div>
        <button class="follow-pill" data-user-id="${u.id}">Follow</button>
      </div>
    `
      )
      .join("");

    el.querySelectorAll(".follow-pill").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await apiFetch(`/users/${btn.dataset.userId}/follow`, { method: "POST", auth: true });
          btn.textContent = "Following";
          btn.classList.add("following");
        } catch (err) {
          btn.disabled = false;
          alert(err.message);
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="notice">Suggestions unavailable.</p>`;
  }
}

async function loadTrendingTags() {
  const el = document.getElementById("trending-tags");
  try {
    const tags = await apiFetch("/posts/tags/trending" + qs({ limit: 8 }));
    if (!tags || !tags.length) {
      el.innerHTML = `<p class="notice">No tags yet.</p>`;
      return;
    }
    el.innerHTML = tags
      .map((t) => `<a href="index.html?tag=${encodeURIComponent(t.tag)}">#${escapeHtml(t.tag)}</a>`)
      .join("");
  } catch (err) {
    el.dataset.fallbackPending = "1";
  }
}

function updateTrendingTagsFallback(posts) {
  const el = document.getElementById("trending-tags");
  if (!el || el.dataset.fallbackPending !== "1") return;
  const counts = {};
  posts.forEach((p) => (p.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  el.innerHTML = sorted.length
    ? sorted.map(([tag]) => `<a href="#" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</a>`).join("")
    : `<p class="notice">No tags yet.</p>`;
  el.querySelectorAll("a[data-tag]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("search-input").value = a.dataset.tag;
      feedState.search = a.dataset.tag;
      feedState.page = 1;
      loadFeed();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("feed");
  renderComposer();

  const tagFromUrl = new URLSearchParams(window.location.search).get("tag");
  if (tagFromUrl) {
    feedState.search = tagFromUrl;
    document.getElementById("search-input").value = tagFromUrl;
  }

  document.getElementById("search-input").addEventListener(
    "input",
    debounce((e) => {
      feedState.search = e.target.value.trim();
      feedState.page = 1;
      loadFeed();
    }, 350)
  );

  document.querySelectorAll(".feed-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".feed-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      feedState.sort = btn.dataset.sort;
      feedState.order = btn.dataset.order;
      feedState.page = 1;
      loadFeed();
    });
  });

  loadFeed();
  loadSuggestions();
  loadTrendingTags();
});
