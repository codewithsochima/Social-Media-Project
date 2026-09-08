document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("create");
  if (requireLoginRedirect()) return;

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
      const post = await apiFetch("/posts", {
        method: "POST",
        auth: true,
        body: {
          title: document.getElementById("title").value.trim(),
          content: document.getElementById("content").value.trim(),
          tags,
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
});
