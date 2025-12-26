# Feature Implementations

This document provides detailed technical information about how each feature was implemented in the BlackPulse application.

## Private Messages Feature

### Files Modified

1. **`src/index.js`**:
   - Added `is_private` and `private_key` columns to the `messages` table
   - Modified `POST /api/messages` to accept `isPrivate` and `privateKey` parameters
   - Modified `GET /api/messages` to support `privateKey` query parameter
   - Updated root route to only show public messages

2. **`views/index.ejs`**:
   - Added dark "KEY" button below message input
   - Added KEY input field and "Send" button (hidden by default)
   - Added modal dialog for message type selection (Public/Private)
   - Added error message display area

3. **`public/js/main.js`**:
   - Added event listeners for KEY button, Send button, and modal dialog
   - Modified message posting flow to show type selection dialog
   - Updated message loading to filter by private KEY
   - Added error handling for invalid KEY input

## File Upload Feature

### Files Modified

1. **`package.json`**:
   - Added new dependency: `multer` for handling file uploads

2. **`src/index.js`**:
   - Added `has_image`, `image_filename`, `image_mime_type`, `image_size` columns to the `messages` table
   - Added Multer configuration for file uploads (50MB limit, all file types)
   - Added `/api/upload` endpoint for backward compatibility (now supports all file types)
   - Added `/api/upload-file` endpoint for general file uploads
   - Added permission middleware for file access (follows same rules as messages)
   - Modified `POST /api/messages` to accept file parameters
   - Enhanced `DELETE /api/messages/:id` to delete associated files
   - Added orphaned file cleanup function (runs hourly)

3. **`views/index.ejs`**:
   - Added file upload button (paperclip icon) below message input area
   - Added hidden file input for file selection (accepts all file types)
   - Added file preview container with remove button (shows image preview or file icon)
   - Added file status display

4. **`public/js/main.js`**:
   - Added file upload state management (`selectedFile` variable)
   - Added `uploadFile()` function for uploading files to server
   - Added file selection and preview functionality (image preview for images, file icon for other types)
   - Modified `renderMessage()` to display files in messages (image preview or download link)
   - Added click-to-view functionality for images
   - Modified message posting to handle files (two-step process: upload then post)
   - Added restriction: messages with files cannot be edited

## User Authentication Feature

### Files Modified

1. **`package.json`**:
   - Added new dependencies: `bcrypt`, `express-session`, `connect-sqlite3`

2. **`src/index.js`**:
   - Added `users` table with `id`, `username`, `password_hash`, `created_at` columns
   - Added `user_id` column to `messages` table for message ownership
   - Added session middleware with SQLite session store
   - Added password utility functions (`hashPassword`, `comparePassword`)
   - Added authentication APIs:
     - `POST /api/auth/register` - User registration
     - `POST /api/auth/login` - User login
     - `POST /api/auth/logout` - User logout
     - `GET /api/auth/me` - Get current user info
   - Modified message APIs to support user authentication:
     - `GET /api/messages` - Returns public messages + user's private messages when logged in
     - `POST /api/messages` - Associates messages with user_id when logged in
     - `PUT /api/messages/:id` - Added permission check (users can only edit their own messages)
     - `DELETE /api/messages/:id` - Added permission check (users can only delete their own messages)
   - Added authentication middleware (`requireAuth`, `getCurrentUser`)

3. **`views/index.ejs`**:
   - Added user area in header with login button (top-right corner)
   - Added login modal with registration button in bottom-left corner
   - Added registration modal
   - Added conditional rendering based on user login status
   - Added user view with username display and logout button

4. **`public/js/main.js`**:
   - Added authentication-related DOM elements
   - Added authentication helper functions (`updateUIForUser`, `checkAuthStatus`, `showError`, `clearError`)
   - Modified `fetchAndRenderMessages` to handle user authentication
   - Added event handlers for login, registration, and logout
   - Modified message posting logic for logged-in users
   - Added registration flow from login modal

## Pagination Feature

### Files Modified

1. **`src/index.js`**:
   - Modified `GET /api/messages` endpoint to support pagination parameters (`page`, `limit`)
   - Added pagination query logic with `LIMIT` and `OFFSET`
   - Added total message count query for calculating total pages
   - Enhanced response format to include pagination metadata:
     - `pagination.page`: Current page number
     - `pagination.limit`: Messages per page (default: 5)
     - `pagination.total`: Total messages matching criteria
     - `pagination.totalPages`: Total number of pages
     - `pagination.hasNextPage`: Whether there's a next page
     - `pagination.hasPrevPage`: Whether there's a previous page

2. **`public/js/main.js`**:
   - Added pagination state variables (`currentPage`, `totalPages`, `currentPrivateKey`)
   - Modified `fetchAndRenderMessages()` function to accept page parameter
   - Added `renderPagination()` function to generate Google-style pagination controls
   - Added `calculatePagesToShow()` function for intelligent page number display (e.g., < 1 2 3 4 5 ... 100 >)
   - Added URL state management functions (`updateURL()`, `parseURLParams()`)
   - Added support for URL parameters (`?page=2&key=secret`) to maintain state

3. **`views/index.ejs`**:
   - Added pagination container (`<div id="pagination-container"></div>`) after message list
   - Pagination controls are dynamically injected by JavaScript

## Database Index Optimization Feature

### Files Modified

1. **`src/index.js`**:
   - Refactored database initialization logic into sequential functions:
     - `initializeDatabase()` - Creates messages table
     - `addMissingColumns()` - Adds missing columns to existing tables
     - `createUsersTable()` - Creates users table
     - `createDatabaseIndexes()` - Creates performance indexes
   - Added the following database indexes:
     - `idx_messages_timestamp` - Optimizes message listing by timestamp (DESC order)
     - `idx_messages_is_private` - Optimizes filtering public/private messages
     - `idx_messages_user_id` - Optimizes finding user's messages
     - `idx_messages_private_key` - Optimizes private message lookup by KEY
     - `idx_messages_has_image` - Optimizes filtering messages with images
     - `idx_users_username` - Optimizes user login by username
   - Improved error handling and logging for database operations

### Performance Benefits

- Faster message listing and pagination
- Faster user authentication
- Faster private message lookup
- Better scalability for research and learning purposes

## Comment System Feature

### Files Modified

1. **`package.json`**:
   - Added new dependencies: `axios` for HTTP requests to LiteLLM, and `dotenv` for loading environment variables.

2. **`docker-compose.yml`**:
   - Added `env_file` directive to load variables from `.env` into the `message-board` service.

3. **`.env`**:
   - New file to store `LITE_LLM_API_KEY`, `LITE_LLM_URL`, and `LITE_LLM_MODEL` for the AI service.

4. **`src/index.js`**:
   - Added `require('dotenv').config();` at the top to load environment variables.

5. **`src/utils/ai-handler.js`**:
   - New module containing `getAIResponse` function to interact with the LiteLLM API. It constructs prompts based on message and comment content and sends requests.

6. **`src/routes/comments.js`**:
   - Modified `POST /api/comments` route to:
     - Import `getAIResponse` from `../../utils/ai-handler.js`.
     - After successfully saving a user's comment, asynchronously check if the comment text contains `@goldierill`.
     - If triggered, fetch the original message content from the database.
     - Call `getAIResponse` with the message and comment content.
     - If an AI response is received, insert it as a new comment from 'GoldieRill', replying to the triggering comment.

7. **`views/index.ejs`**:
   - Added comments section below messages section
   - Added comment form with textarea and post button
   - Added comments container to display comments and replies
   - Added comments pagination container
   - Conditionally shows user information for comments (logged in vs anonymous)

8. **`public/js/main.js`**:
   - Added comments-related DOM element references
   - Added `fetchAndRenderComments()` function to load comments for current page
   - Added `createCommentElement()` and `createReplyElement()` functions to render comments with recursive reply support
   - Added `renderCommentsPagination()` function for Google-style pagination
   - Implemented `handlePostComment()`, `handleVote()`, `handleEditComment()`, `handleDeleteComment()`, and `handleReply()` functions
   - Added delegated event listeners for comment actions (vote, edit, delete, reply)
   - Implemented recursive reply rendering to support unlimited nesting depth
   - Added functionality for posting replies at any level of nesting

## JavaScript Code Modernization (ES Modules)

The entire frontend JavaScript codebase was refactored from a collection of scripts dependent on the global `window` object to a modern, modular architecture using ES Modules (`import`/`export`).

### Benefits

*   **Clearer Dependencies**: Each JavaScript file now explicitly declares its dependencies, making the codebase easier to understand, maintain, and debug.
*   **Single Entry Point**: `main.js` now acts as the sole entry point for the application, loaded with `type="module"` in `index.ejs`. It is responsible for initializing all other modules and event listeners.
*   **Improved Maintainability & Scalability**: This refactoring eliminates the risk of global namespace pollution, improves code organization, and lays the groundwork for future optimizations like tree-shaking with a bundler.

### Key Files Created/Modified

*   `public/js/main.js`: Rewritten to be the application's central coordinator.
*   `public/js/state.js`: New module to manage shared application state (e.g., `currentUser`, `messages`).
*   `public/js/ui-elements.js`: New module to centralize all DOM element selections.
*   `public/js/utils.js`: New module for shared utility functions (`createButton`, `showError`, etc.).
*   All other `.js` files in `public/js/`: Refactored to remove global dependencies, now importing required functions/variables and exporting their own functionality.
*   `views/index.ejs`: Modified to load only the `main.js` module script, removing all other individual script tags.

## Trending Feed Feature

### Files Modified

1. **`src/database/init.js`**:
    - Added `comment_count` (INTEGER) and `hot_score` (REAL) columns to the `messages` table to store engagement metrics.
    - Added `idx_messages_hot_score` index on the `hot_score` column to optimize sorting performance.
    - Implemented a `backfillHotScores` function that runs on startup to calculate and populate `comment_count` and `hot_score` for all existing messages, ensuring historical data is compatible with the new feature.

2. **`src/utils/hot-score.js`**:
    - New utility module created to house the `calculateHotScore` function.
    - This function implements a Reddit-style trending algorithm: `Score = log10(total_likes_on_comments) + (timestamp / 45000)`, which balances popularity (total likes on comments) with time decay.

3. **`src/routes/comments.js`**:
    - Modified the comment creation (`POST /`), deletion (`DELETE /:id`), and liking (`POST /:id/like`) routes.
    - When a comment is added, removed, or liked/unliked, it now asynchronously updates the parent message's `comment_count` (for comment count) and recalculates its `hot_score` based on the **sum of likes on all its comments**, keeping the trending rank up-to-date.

4. **`src/routes/messages.js`**:
    - Added a new API endpoint: `GET /api/messages/trending`.
    - This endpoint retrieves public messages, ordered by `hot_score` in descending order, and supports pagination.

5. **`public/js/api-rendering-logic.js`**:
    - Modified the `fetchAndRenderMessages` function to detect when the `currentFeedType` is 'trending'.
    - When it is, the function now calls the new `/api/messages/trending` endpoint instead of the standard message list endpoint.

## Message Liking & Liked Feed Feature

### Files Modified

1. **`src/database/init.js`**:
    - Added `likes` (INTEGER) and `likers` (TEXT JSON array) columns to the `messages` table.

2. **`src/routes/messages.js`**:
    - Added a new API endpoint: `POST /api/messages/:id/like` to toggle like status for messages.
    - Modified `GET /api/messages` and `GET /api/messages/trending` to include `likes` count and `userHasLiked` status in their responses.
    - Added a new API endpoint: `GET /api/messages/liked` to fetch all messages liked by the current logged-in user.

3. **`views/index.ejs`**:
    - Added new "Liked" filter buttons to both desktop and mobile navigation.

4. **`public/js/main-rendering-function.js`**:
    - Modified message rendering to include a text-based "like" button (gold when active) and a likes counter.

5. **`public/js/message-click-handler.js`**:
    - Added event handling logic for the new message "like" button, including calling the new API endpoint and refreshing messages.

6. **`public/js/ui-elements.js`**:
    - Exported new DOM element selectors for the "Liked" feed buttons.

7. **`public/js/initial-setup.js`**:
    - Added event listeners and styling updates for the new "Liked" feed buttons.

8. **`public/js/api-rendering-logic.js`**:
    - Modified `fetchAndRenderMessages` to call the new `GET /api/messages/liked` endpoint when the "Liked" feed is selected.

## StackEdit Markdown Editor Integration

The application integrates a customized version of the **StackEdit Markdown Editor** to provide a rich, distraction-free editing experience for both new messages and existing message edits.

### Files Modified

1. **`stackedit.js/` (Local Customization)**:
   - A local clone of the `stackedit-js` library is maintained within the project to allow for deep customization of the editor's appearance, overcoming remote API limitations.
   - **Simulated Dark Mode**: To match the application's pure dark aesthetic, we implemented a custom **CSS Filter Solution** within the library's core:
     - Injected `filter: invert(90%) hue-rotate(180deg);` into the editor's `iframe`. This transforms the light-themed StackEdit interface into a beautiful dark mode.
     - Modified the internal `styleContent` to set the container background to `rgba(0, 0, 0, 0.7)` and the iframe container to `#1e1e1e`, effectively eliminating "white flash" during loading.
     - Updated the close button SVG color to `#aaa` for better visibility.
   - These changes were applied directly to the minified `docs/lib/stackedit.min.js` to ensure they are active in the production bundle.

2. **`Dockerfile` Build Logic**:
   - The build process was updated to prioritize our local dark-mode-optimized version over the standard npm package.
   - A `COPY` command was added to specifically move `stackedit.min.js` into the `public/js/vendor/` directory, ensuring the containerized application uses the modified library.

3. **Frontend Implementation**:
   - **Main Composer**: Integrated into `public/js/initial-setup.js` to provide full-screen Markdown editing for new posts.
   - **Message Editing**: Added to the edit view in `public/js/message-edit-toggle.js`, allowing users to use the MD editor even when tweaking existing messages.
   - **Styling**: The `createButton` utility in `public/js/utils.js` was extended to support a specialized "MD" button style that fits perfectly into the BlackPulse UI.
