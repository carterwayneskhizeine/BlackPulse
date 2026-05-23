# RAG Semantic Search & AI Context Enhancement

HyperBoard uses a RAG (Retrieval-Augmented Generation) pipeline to give the AI assistant access to historical board content when generating replies.

## Trigger Keywords

| Mention | Behavior |
|---------|----------|
| `@goldierill` / `@GoldieRill` | AI replies using **only the current post and comments** as context. No RAG search is performed. |
| `@rag` / `@RAG` | AI replies with **RAG enabled**: searches Qdrant for relevant historical posts and injects them into the prompt. |

Both triggers post a reply from `GoldieRill`. The difference is whether historical board content is retrieved.

## Architecture

```
User posts "@goldierill ..."
         │
         ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │ indexContent │────▶│  chunkText   │────▶│   embed (API)    │
  │ (rag-service)│     │  (chunker)   │     │ (SiliconFlow)    │
  └──────────────┘     └──────────────┘     └────────┬─────────┘
                                                      │
                                              ┌───────▼───────┐
                                              │    Qdrant      │
                                              │  (vector DB)   │
                                              └───────┬───────┘
                                                      │
User mentions @goldierill                             │
         │                                            │
         ▼                                            ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │ findRelevant │────▶│ fetchFull    │────▶│  LLM (OpenRouter) │
  │  SourceIds   │     │ Content(DB)  │     │  DeepSeek V4      │
  └──────────────┘     └──────────────┘     └──────────────────┘
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| Embedding API | `src/utils/embedding.js` | Calls SiliconFlow API to generate 2560-dim vectors |
| Text Chunker | `src/utils/chunker.js` | Splits text into ~500-char chunks |
| RAG Service | `src/utils/rag-service.js` | Indexing, search, context building |
| AI Handler | `src/utils/ai-handler.js` | LLM prompt construction, DB content fetching |
| Vector Migration | `src/database/vec-migration.js` | Bulk reindex of existing content |
| Vector DB | Qdrant | Stores embedding vectors (Docker container) |

## Indexing Flow

When a user creates a message or comment:

1. `sampleText()` takes first 1000 + last 1000 chars (max 2000) for long posts
2. `chunkText()` splits into ~500-char chunks at sentence boundaries
3. Each chunk is sent to SiliconFlow (`qwen/qwen3-embedding-4b`) for embedding
4. Embedding vector + metadata stored in Qdrant (`hyperboard` collection)

**Not indexed**: Private messages, AI-generated comments

## Search Flow (when @rag is mentioned)

1. Query text cleaned (remove `@rag`, `@goldierill`, trim)
2. `findRelevantSourceIds()` searches Qdrant for top 5 similar chunks
3. `fetchFullContent()` retrieves full post content from SQLite for matched IDs
4. Content injected into LLM system prompt as "Relevant historical posts"
5. LLM generates response using both the current message and historical context

## Context-Only Flow (when @goldierill is mentioned)

1. RAG search is **skipped entirely**
2. LLM receives only the current message and the triggering comment
3. Response is based solely on what is visible in the current thread

## Environment Variables

```env
# Embedding (SiliconFlow)
EMBEDDING_API_URL=https://api.siliconflow.cn/v1/embeddings
EMBEDDING_API_KEY=sk-your-api-key-here
EMBEDDING_MODEL=qwen/qwen3-embedding-4b
EMBEDDING_DIMENSION=2560

# Vector DB (Qdrant)
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=hyperboard

# AI Chat (OpenRouter)
AI_CHAT_API_URL=https://openrouter.ai/api/v1/chat/completions
AI_CHAT_API_KEY=sk-your-api-key-here
AI_CHAT_MODEL=deepseek/deepseek-v4-flash

# Search
DEFAULT_SEARCH_MODE=hybrid    # keyword | semantic | hybrid
RUN_VEC_MIGRATION=false       # auto-reindex on startup
```

## Manual Reindex

To rebuild the vector index (e.g., after changing embedding model):

```bash
curl -X POST http://localhost:61989/api/admin/reindex
```

Returns `{"status":"started"}` immediately; indexing runs in the background.

## Customizing AI Prompts

The AI assistant's behavior is controlled by `systemPrompt` in `src/utils/ai-handler.js` (around line 83). Key sections:

- **Rules** — instructions for how the AI should behave and use historical context
- **Historical posts** — injected dynamically via `${ragContext}` when RAG finds matches
- **User prompt template** — the message and comment content (around line 97)

## Search API

The `GET /api/search` endpoint supports three modes via the `mode` query parameter:

| Mode | Description |
|------|-------------|
| `keyword` | SQL `LIKE` search only |
| `semantic` | Vector similarity search via Qdrant |
| `hybrid` | Combines both (default) |

## Troubleshooting

See [OOM Debug Guide](oom-debug.md) for memory-related issues with RAG indexing.
