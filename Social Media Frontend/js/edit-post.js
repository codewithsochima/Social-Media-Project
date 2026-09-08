function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadEditForm() {
  const root = document.getElementById("edit-root");
  const id = getParam("id");
  if (!id) {
    root.innerHTML = `<p class="error">No post id given.</p>`;
    return;
  }

  try {
    const post = await apiFetch(`/posts/${encodeURIComponent(id)}`);
    const me = getCurrentUser();
    if (!me || !post.author || me.id !== post.author.id) {
      root.innerHTML = `<p class="error">You can only edit your own posts.</p>`;
      return;
    }

    root.innerHTML = `
      <form id="post-form" class="card">
        <label>Title
          <input type="text" id="title" required value="${escapeHtml(post.title)}" />
        </label>
        <label>Content
          <textarea id="content" required>${escapeHtml(post.content)}</textarea>
        </label>
        <label>Tags (comma-separated)
          <input type="text" id="tags" value="${escapeHtml((post.tags || []).join(", "))}" />
        </label>
        <label>State
          <select id="state">
            <option value="draft" ${post.state === "draft" ? "selected" : ""}>Draft</option>
            <option value="published" ${post.state === "published" ? "selected" : ""}>Published</option>
          </select>
        </label>
        <div id="form-error" class="error" style="display:none;"></div>
        <div class="btn-row">
          <button type="submit" id="submit-btn">Save changes</button>
          <a class="btn secondary" href="post.html?id=${post.id}">Cancel</a>
        </div>
      </form>
    `;

    document.getElementById("post-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-error");
      const btn = document.getElementById("submit-btn");
      errEl.style.display = "none";
      btn.disabled = true;

      const tags = document
        .getElementById("tags")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      try {
        await apiFetch(`/posts/${post.id}`, {
          method: "PATCH",
          auth: true,
          body: {
            title: document.getElementById("title").value.trim(),
            content: document.getElementById("content").value.trim(),
            tags,
            state: document.getElementById("state").value,
          },
        });
        window.location.href = `post.html?id=${post.id}`;
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = "block";
      } finally {
        btn.disabled = false;
      }
    });
  } catch (err) {
    root.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("feed");
  loadEditForm();
});
