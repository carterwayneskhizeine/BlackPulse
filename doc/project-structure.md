# Project Structure

## Directory Layout

### `./data/`
Contains the `messages.db` SQLite database file (persisted via Docker volume).

*   `data/uploads/`: Directory for uploaded image files (created automatically).

### `./public/`
Static assets (CSS, client-side JS).

*   `public/js/main.js`: Main client-side script for dynamic interactions (modified to support private messages).
*   `public/style.css`: Compiled Tailwind CSS output.

### `./src/`
Server-side source code and input CSS.

*   `src/index.js`: Express.js backend server (modified to support private messages API).
*   `src/input.css`: Tailwind CSS input file.

### `./views/`
EJS template files.

*   `views/index.ejs`: Main application layout (modified to add KEY button, input field, and modal dialog).

## Configuration Files

### `Dockerfile`
Defines the Docker image build process.

### `docker-compose.yml`
Defines the services, networks, and volumes for Docker Compose.

### `package.json`
Node.js project metadata and dependencies.

### `tailwind.config.js`
Tailwind CSS configuration.

### `.gitignore`
Specifies intentionally untracked files to ignore.

## Database Schema

### Messages Table

- `id`: Primary key
- `content`: Message text content
- `timestamp`: Creation timestamp
- `is_private`: Boolean flag for private messages
- `private_key`: KEY for private message access
- `user_id`: Foreign key to users table (nullable for anonymous messages)
- `has_image`: Boolean flag for file attachment
- `image_filename`: Uploaded file filename
- `image_mime_type`: File MIME type
- `image_size`: File size in bytes
- `likes`: Like counter
- `likers`: JSON array of user IDs who liked
- `comment_count`: Total number of comments
- `hot_score`: Trending score calculation

### Users Table

- `id`: Primary key
- `username`: Unique username
- `password_hash`: Bcrypt hashed password
- `created_at`: Account creation timestamp

### Comments Table

- `id`: Primary key
- `text`: Comment text content
- `url`: Page URL for the comment
- `user_id`: Foreign key to users table (nullable for anonymous comments)
- `parent_id`: Parent comment ID for nested replies (nullable)
- `timestamp`: Creation timestamp
- `likes`: Like counter
- `likers`: JSON array of user IDs who liked

## Frontend Modules (ESM)

### Core Modules

- `public/js/main.js`: Application entry point and coordinator
- `public/js/state.js`: Shared application state management
- `public/js/ui-elements.js`: Centralized DOM element selections
- `public/js/utils.js`: Shared utility functions

### Feature Modules

- `public/js/api-rendering-logic.js`: API calls and rendering logic
- `public/js/main-rendering-function.js`: Message rendering functions
- `public/js/message-click-handler.js`: Message interaction handlers
- `public/js/message-edit-toggle.js`: Message editing functionality
- `public/js/comment-system.js`: Comment system logic
- `public/js/pagination.js`: Pagination logic
- `public/js/initial-setup.js`: Initial setup and event listeners

### Vendor Libraries

- `public/js/vendor/showdown.min.js`: Markdown parser
- `public/js/vendor/mermaid.min.js`: Diagram rendering
- `public/js/vendor/stackedit.min.js`: Markdown editor (customized for dark mode)

## Backend Modules

### Core Server

- `src/index.js`: Main Express server
- `src/database/init.js`: Database initialization and schema creation

### Route Handlers

- `src/routes/messages.js`: Message API endpoints
- `src/routes/comments.js`: Comment API endpoints
- `src/routes/auth.js`: Authentication API endpoints
- `src/routes/upload.js`: File upload endpoints

### Utilities

- `src/utils/ai-handler.js`: AI response integration
- `src/utils/hot-score.js`: Trending algorithm calculation

## API Endpoints

### Messages

- `GET /api/messages` - Get public messages (supports pagination)
- `GET /api/messages/trending` - Get trending messages
- `GET /api/messages/liked` - Get user's liked messages
- `POST /api/messages` - Create new message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/like` - Toggle like on message

### Comments

- `GET /api/comments` - Get comments for URL (supports pagination)
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Toggle like on comment

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Upload

- `POST /api/upload` - Upload image (legacy endpoint)
- `POST /api/upload-file` - Upload any file type
