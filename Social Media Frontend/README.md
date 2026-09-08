# Social Media Frontend (plain HTML/CSS/JS)

A static, no-build frontend for the social media API described in
`API_CONTRACT.md`. No frameworks, no bundler — just open it in a browser
or serve it with any static file server.

Layout is a 3-column dashboard: a left sidebar (profile + nav, on every
page), a center feed/content column, and — on the feed page only — a
right column with "Suggestions" and "Trending tags" panels. Those two
panels call optional endpoints (see the bottom of `API_CONTRACT.md`) and
degrade gracefully (client-side tag aggregation, hidden suggestions) if
you don't implement them.

## Pages

- `index.html` — public feed of published posts. Search, sort, paginate. No login required.
- `post.html?id=<id>` — single post with author info, like/unlike, and
  edit/publish/delete actions if you're the owner.
- `login.html`, `signup.html` — auth.
- `create-post.html` — new post (always starts as a draft).
- `edit-post.html?id=<id>` — edit content/tags/state, owner only.
- `profile.html?id=<id>` (or no `id` = your own profile) — user info,
  follow/unfollow, tabs for Posts / Following / Followers. Draft filter
  shows up only on your own profile.

## Running it

This is static — no build step. Two options:

1. Open `index.html` directly in a browser, or
2. Serve it (recommended, avoids some browser file:// quirks):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Pointing it at your backend

Click the ⚙ icon in the navbar and set the API base URL (e.g.
`http://localhost:5000/api` or your deployed backend URL). It's saved in
`localStorage`, so you only need to set it once per browser. Default is
`http://localhost:5000/api` — change it in `js/config.js` if you want a
different default.

## Auth

- JWT is stored in `localStorage` (`auth_token`) along with the user object
  (`auth_user`).
- The token's `exp` claim is decoded client-side; if it's expired the app
  clears auth state automatically on the next check (matches the 1 hour
  expiry in the spec).

## What the backend needs to implement

See `API_CONTRACT.md` for the full list of endpoints, request/response
shapes, the pagination envelope, and error format this frontend expects.
