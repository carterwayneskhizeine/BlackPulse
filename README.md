# BlackPulse

A feature-rich anonymous message board web application built with Node.js, Express, and EJS. It uses SQLite3 for data storage and is fully containerized with Docker. The frontend is built with **modern, modular JavaScript (ESM)**, and the application features a pure dark mode interface, support for Markdown content, file uploads (including video playback), a comment system with infinite nesting, **AI-powered responses to specific mentions**, user authentication, Google-style pagination, YouTube video embedding, and allows users to post, edit, and delete messages anonymously.

![Preview of the Application](PreviewImage.jpg)

## Features

*   **Anonymous Posting**: Share your thoughts without revealing your identity.
*   **Pure Dark Mode**: A sleek, modern dark theme is enforced throughout the application. No theme switching needed.
*   **SQLite3 Database**: Lightweight and efficient data storage.
*   **Data Persistence**: All messages are stored persistently using Docker volumes, ensuring your data is safe across container restarts.
*   **Markdown Support**: Write messages using Markdown syntax (headings, bold, italics, lists, code blocks, etc.), which will be rendered beautifully.
*   **Edit & Delete Messages**: Users can edit their previously posted messages or delete them.
*   **Private Messages with KEY Protection**: Post private messages protected by a KEY. Only users who know the correct KEY can view these messages.
*   **User Authentication**: Register and login system with session-based authentication.
*   **User-Specific Private Messages**: Logged-in users can view all their private messages without entering KEYs individually.
*   **Embedded Video Content**: Automatically embeds YouTube links pasted into messages as responsive video players.
*   **File Upload Support**: Upload and display files in messages (one file per message, max 50MB). Images show previews, videos (e.g., MP4) are playable, and other files show download links.
*   **Pagination with Google-Style Navigation**: Messages are displayed with Google search results-style pagination (e.g., < 1 2 3 4 5 ... 100 >). Each page shows 5 messages with previous/next buttons and direct page navigation.
*   **Database Performance Optimization**: Built-in indexes for faster queries, better scalability for research and learning.
*   **Responsive Design**: The application is designed to be accessible and usable across various devices, with mobile-friendly buttons.
*   **Dockerized Deployment**: Easy setup and deployment using Docker and Docker Compose.
*   **AI-Powered Comment Responses**: Users can mention `@goldierill` in comments to receive AI-generated replies based on the message context.
*   **Like System (Comments & Messages)**: Express your appreciation by liking comments and main messages. The 'like' button dynamically changes color when active.
*   **Comment System with Infinite Reply Support**: Add comments to any page with unlimited nesting depth, featuring liking, editing, and deletion capabilities.
*   **Trending Feed**: A "Trending" feed that uses a Reddit-style algorithm to sort messages based on the **total likes on comments** and time-decay, allowing users to discover the most popular and engaging content dynamically.
*   **Liked Messages Feed**: Logged-in users can easily access a dedicated "Liked" feed, showcasing all messages they have personally liked.

## Tech Stack

*   **Backend**: Node.js (Latest Alpine) with Express.js
*   **Database**: SQLite3 with performance indexes for optimized queries
*   **Authentication**: Express Session with SQLite session store, bcrypt for password hashing
*   **Templating**: EJS
*   **Styling**: Tailwind CSS (configured for `darkMode: 'class'`)
*   **Client-side Logic**: Native JavaScript (Fetch API)
*   **File Upload**: Multer for handling file uploads (all types, up to 50MB)
*   **Markdown Editor**: StackEdit (customized for dark mode)
*   **Containerization**: Docker, Docker Compose

## Documentation

For detailed information about installation, usage, and development, please refer to the documentation in the [doc/](doc/) folder:

- **[Installation Guide](doc/installation.md)** - Prerequisites, setup, and getting started
- **[Usage Guides](doc/usage/)** - Comprehensive usage documentation
  - [Public Messages](doc/usage/public-messages.md)
  - [Private Messages](doc/usage/private-messages.md)
  - [User Authentication](doc/usage/user-authentication.md)
  - [File Upload](doc/usage/file-upload.md)
  - [Embedded Videos](doc/usage/embedded-videos.md)
  - [Comment System](doc/usage/comment-system.md)
- **[API Usage](doc/api-usage.md)** - API endpoints and curl examples
- **[Project Structure](doc/project-structure.md)** - Codebase organization
- **[Feature Implementations](doc/feature-implementations.md)** - Technical details of features
- **[Development Guide](doc/development.md)** - Development workflow and rebuilding
- **[Database Management](doc/database-management.md)** - Database operations and maintenance

## Quick Start

```bash
# Clone the repository
git clone https://github.com/carterwayneskhizeine/BlackPulse.git
cd BlackPulse

# Build and run with Docker
docker compose up --build -d

# Access the application
# Open http://localhost:1989 in your browser
```

## License

This project is licensed under the [WTFPL](LICENSE) - see the LICENSE file for details.

---

Built by Love.
