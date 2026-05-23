# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HyperBoard is an anonymous message board with a retro Windows 95 UI, AI-powered responses (RAG with Qdrant), and hybrid search (keyword + semantic). It's a single monolithic Node.js/Express app — no monorepo, no frontend framework. The frontend uses vanilla ES6 modules loaded natively by the browser.

## Common Commands

This project runs entirely in Docker, not locally. All npm commands are executed inside the container.

```bash
docker compose up --build -d          # Build and start all services
docker compose up --build -d --no-deps message-board  # Rebuild only the app
docker compose logs -f message-board  # Tail app logs
docker compose exec message-board npm run build:css   # Compile Tailwind CSS inside container
docker compose down                   # Stop all services
```

The app is served at `http://localhost:61989` (host port 61989 → container port 1989).

There is no test framework, linter, or TypeScript in this project.

## Architecture

### Backend (`src/`)

- **Entry point**: `src/index.js` — Express app setup, middleware registration, route mounting, DB init
- **Routes** (`src/routes/`): REST API handlers split by domain — `messages.js`, `comments.js`, `auth.js`, `search.js`, `upload.js`, `invite.js`
- **Middleware** (`src/middleware/`): `auth.js` (session-based auth), `session.js` (SQLite session store), `upload.js` (Multer config, 50MB limit), `imageAccess.js` (file access control), `invite.js` (invitation-only mode)
- **Database** (`src/database/`): SQLite3 with WAL mode. `init.js` creates schema + indexes, `cleanup.js` removes orphaned files hourly, `vec-migration.js` rebuilds vector index
- **Utils** (`src/utils/`): `rag-service.js` (Qdrant operations), `ai-handler.js` (LLM calls via OpenRouter), `embedding.js` (SiliconFlow embedding API), `chunker.js` (text splitting for vectors), `hot-score.js` (Reddit-style trending)

### Frontend (`public/js/`)

~30 ES6 modules with no bundler. Entry point is `public/js/main.js`. Key patterns:
- `state.js` — centralized app state object
- `ui-elements.js` — cached DOM references
- Feature modules prefixed by domain: `message-*.js`, `comment-*.js`, `auth-*.js`, `file-*.js`
- `main-rendering-function.js` — message list rendering

### Views

Single EJS template: `views/index.ejs` — the entire app renders from this one template.

### Data

- `data/messages.db` — main SQLite database (messages, users, comments)
- `data/sessions.db` — session store
- `data/uploads/` — uploaded files
- `qdrant_data/` — Qdrant vector DB persistence

## Key Patterns

- **Authentication**: Session-based (express-session + connect-sqlite3). First registered user becomes admin automatically. Passwords hashed with bcrypt (10 rounds).
- **AI assistant**: Triggered by `@goldierill` or `@rag` mentions in comments or messages. `@goldierill` replies using only the current post/comment context (no RAG). `@rag` additionally searches Qdrant for relevant historical posts and injects them into the prompt. Flow: mention detection → (RAG search if `@rag`) → context assembly → LLM call (DeepSeek via OpenRouter) → AI comment posted as `GoldieRill`. Max 2 concurrent AI calls.
- **Search**: Three modes — keyword (SQL LIKE), semantic (Qdrant vector similarity), hybrid (default). Configured via `DEFAULT_SEARCH_MODE` env var.
- **Trending**: Hot score = `log10(total_comment_likes) + (unix_timestamp / 45000)`, recalculated on comment like changes.
- **Private messages**: KEY-based access control. Users can generate a private key to share access.

## Environment Variables

Required for AI/search features (in `.env`):

- `AI_CHAT_API_URL` / `AI_CHAT_API_KEY` / `AI_CHAT_MODEL` — OpenRouter LLM config
- `EMBEDDING_API_URL` / `EMBEDDING_API_KEY` / `EMBEDDING_MODEL` / `EMBEDDING_DIMENSION` — SiliconFlow embedding config
- `QDRANT_URL` — Qdrant address (`http://qdrant:6333` in Docker)
- `DEFAULT_SEARCH_MODE` — `keyword`, `semantic`, or `hybrid`
- `INVITATION_MODE` / `INVITATION_CODE` — optional invite-only mode

## Docker Setup

Two services in `docker-compose.yml`:
1. **message-board** — the Node.js app (host port 61989 → container 1989, `--max-old-space-size=768`)
2. **qdrant** — vector database (ports 6333/6334, 256MB memory limit)

Both on the `hyperboard-net` bridge network. Data persisted via bind mounts to `./data` and `./qdrant_data`.

## Styling

Tailwind CSS with a custom retro Windows 95 theme defined in `tailwind.config.js`. Run `npm run build:css` after changing Tailwind classes or the config.
