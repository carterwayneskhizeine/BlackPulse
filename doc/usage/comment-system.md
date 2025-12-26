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

### Get AI Response

1. Post a comment mentioning `@goldierill` (e.g., "@goldierill what do you think about this?")
2. The AI will analyze the original message and your comment
3. An AI-generated response from 'GoldieRill' will automatically appear as a reply to your comment
4. The response is context-aware and based on the content of the discussion

### AI Configuration Requirements

- The AI feature requires proper configuration of environment variables in the `.env` file
- Uses LiteLLM API for generating responses
- Supports various LLM providers through LiteLLM proxy
- If not configured, the mention will be treated as a regular comment without AI response
