# Comment System

## Post a Comment

1. Scroll down to the comments section below the messages.
2. Type your comment in the text area.
3. Click "Post Comment" to submit.

**Note**: Comments support Markdown formatting and can be posted anonymously or while logged in.

## Reply to a Comment

1. Click the "Reply" button on any comment.
2. A reply text area will appear below the comment.
3. Type your reply and click "Post Reply".

**Note**: Replies can be nested infinitely, allowing deep conversation threads.

## Edit Your Comment

- Click the "Edit" button on your own comment.
- Modify the text and click "Save".

**Note**: Comments can only be edited within a short time window after posting (configurable).

## Delete Your Comment

- Click the "Delete" button on your own comment.
- Confirm deletion to remove the comment.

**Note**: Deleted comments are marked as deleted but may remain visible depending on settings.

## Like Comments

- Click the "like" button below any comment to express your appreciation. The text will turn gold.
- Click the "like" button again to unlike the comment. The text will revert to its original color.
- The number of likes is displayed next to the button.

## View Comment Threads

- Comments are displayed in a nested tree structure.
- Click on a comment to expand/collapse its replies.
- Use pagination to navigate through large comment sections.

## AI-Powered Responses

HyperBoard's AI assistant (`GoldieRill`) supports two trigger modes:

### Context-Only Mode — `@goldierill`

1. Post a comment mentioning `@goldierill` (e.g., "@goldierill what do you think?")
2. The AI will reply based **only on the current post and its comments**
3. No historical board content is retrieved — the response stays focused on this thread

### RAG Mode — `@rag`

1. Post a comment mentioning `@rag` (e.g., "@rag have I asked about this before?")
2. The AI searches historical board content in Qdrant for relevant posts
3. Retrieved context is injected into the prompt alongside the current thread
4. Useful when you want the AI to reference past discussions or cross-thread knowledge

In both cases the reply appears automatically from `GoldieRill`.

### AI Configuration Requirements

- Requires `AI_CHAT_API_URL`, `AI_CHAT_API_KEY`, `AI_CHAT_MODEL` in `.env`
- RAG mode additionally requires Qdrant and embedding API config (see [RAG docs](../rag-ai.md))
- If not configured, mentions are treated as regular comments without AI response
