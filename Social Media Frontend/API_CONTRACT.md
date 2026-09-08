# API Contract

This frontend is plain HTML/CSS/JS and talks to your Express/MongoDB backend
over this contract. The base URL is configurable at runtime (gear icon in the
navbar → stored in `localStorage.api_base_url`, default `http://localhost:5000/api`).

All request/response bodies are JSON. Auth uses `Authorization: Bearer <token>`.
JWT expires in 1 hour — frontend checks `exp` client-side and logs the user out
when expired, but the backend must also reject expired tokens (401).

Paginated list responses use this envelope everywhere:

```json
{
  "data": [ ... ],
  "page": 1,
  "limit": 20,
  "total": 137,
  "totalPages": 7
}
```

---

## Auth

### POST /auth/signup
Body: `{ first_name, last_name, username, email, password }`
201 → `{ user: { id, first_name, last_name, username, email } }`

### POST /auth/login
Body: `{ email, password }`
200 → `{ token, user: { id, first_name, last_name, username, email } }`
(token expires in 1h)

---

## Users

### GET /users/:id
Public. 200 → `{ id, first_name, last_name, username, email, followers_count, following_count, is_following }`
`is_following` = true/false/null (null when not logged in) — whether the current user follows this user.

### GET /users/me
Auth required. 200 → same shape as above, for the logged-in user.

### GET /users/:id/posts?state=published&page=1&limit=10
Public (only `state=published` is allowed for non-owners; backend should force this).
If the requester is the owner and authenticated, `state` may be `draft`, `published`, or omitted (= all).
200 → paginated envelope of Post objects.

### GET /users/:id/followers?page=1&limit=20
200 → paginated envelope of `{ id, first_name, last_name, username }`

### GET /users/:id/following?page=1&limit=20
200 → paginated envelope of `{ id, first_name, last_name, username }`

### POST /users/:id/follow
Auth required. Follows user `:id`. 400 if following self or already following.
201 → `{ following: true }`

### DELETE /users/:id/follow
Auth required. Unfollows user `:id`.
200 → `{ following: false }`

---

## Posts

### GET /posts?page=1&limit=20&search=&author=&tags=&sort=timestamp|like_count|comment_count&order=asc|desc
Public. Only returns `state=published` posts.
`search` matches title/author username/tags (per spec, "searchable by author, title and tags").
200 → paginated envelope of Post objects (list view — no full author object needed, `author_username`/`author_id` is enough).

### GET /posts/:id
Public — 404/403 if the post is a draft and requester isn't the owner.
200 → Post object **with full nested `author`**:
```json
{
  "id": "...",
  "title": "...",
  "content": "...",
  "tags": ["tag1","tag2"],
  "state": "published",
  "like_count": 12,
  "comment_count": 3,
  "timestamp": "2026-09-01T12:00:00.000Z",
  "liked_by_me": false,
  "author": { "id": "...", "first_name": "...", "last_name": "...", "username": "..." }
}
```
`liked_by_me` is `false`/`null` when not logged in.

### POST /posts
Auth required. Body: `{ title, content, tags: [] }` → created with `state: "draft"`.
201 → Post object.

### PATCH /posts/:id
Auth required, owner only. Body: any of `{ title, content, tags, state }` (`state`: `"draft"` | `"published"`).
200 → updated Post object.

### DELETE /posts/:id
Auth required, owner only. 204.

### POST /posts/:id/like
Auth required. 400 if already liked.
201 → `{ liked: true, like_count }`

### DELETE /posts/:id/like
Auth required.
200 → `{ liked: false, like_count }`

---

## Optional (nice-to-have, used by the "Suggestions" / "Trending tags" panels)

These aren't in the original requirements — the frontend calls them optimistically
and just hides the panel/falls back to client-side data if you don't implement them.

### GET /users/suggestions?limit=5
Auth required. Users the current user doesn't already follow (excluding self).
200 → `[{ id, first_name, last_name, username }]`

### GET /posts/tags/trending?limit=8
Public. Most-used tags across published posts.
200 → `[{ tag, count }]`

If these 404 or error, the frontend falls back to: no suggestions panel, and
trending tags computed client-side from whatever posts are currently loaded
in the feed.

---

## Errors

Use a consistent error shape so the frontend can show messages:
```json
{ "error": "Human readable message" }
```
Use standard status codes: 400 validation, 401 unauthenticated, 403 forbidden
(not the owner), 404 not found, 409 conflict (duplicate follow/like/username/email).
