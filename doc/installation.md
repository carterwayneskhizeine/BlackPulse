# Installation Guide

This guide will help you get a copy of the BlackPulse project up and running on your local machine.

## Prerequisites

You need to have Docker and Docker Compose installed on your system.

*   [Install Docker](https://docs.docker.com/get-docker/)

## Important Note for Cross-Platform Compatibility

sqlite3 is a native Node.js module that needs to be compiled on specific platform architectures. Binaries compiled on Windows are not compatible with Linux Docker containers.

To rebuild the container: Reinstall and recompile all dependencies inside the container
```bash
docker compose up --build -d
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/carterwayneskhizeine/BlackPulse.git
cd AnonymousMessageBoard
```

### 2. Configure AI Functionality (Optional)

To enable the AI-powered comment responses feature (`@goldierill` mentions), you need to set up environment variables:

*   Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env_example .env
    ```

*   Edit the `.env` file with your LiteLLM configuration:
    ```
    LITE_LLM_API_KEY=your-actual-api-key
    LITE_LLM_URL=http://your-llm-endpoint/v1/chat/completions
    LITE_LLM_MODEL=your-model-name
    ```

*   **Note**: If you don't configure these variables, the AI functionality will be disabled, but the rest of the application will work normally.

### 3. Build and Run the Application

Using Docker Compose:
```bash
docker compose up --build -d
```

This command will:
*   Build the Docker image for the `message-board` service based on the `Dockerfile`.
*   Install all Node.js dependencies, including Tailwind CSS and Showdown.js.
*   Run the Tailwind CSS build process.
*   Start the `message-board` container in detached mode (`-d`).
*   Map port `1989` from your host to the container.
*   Mount a local `./data` directory to `/app/data` inside the container for SQLite database persistence.

## Accessing the Application

Once the Docker containers are up and running, open your web browser and navigate to:

**[http://localhost:1989](http://localhost:1989)**

## Troubleshooting

### Port Already in Use

If port 1989 is already in use on your system, you can modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3000:1989"  # Change to your preferred port
```

### Container Won't Start

If the container fails to start, check the logs:

```bash
docker compose logs message-board
```

### Database Issues

If you encounter database-related errors, try removing the database files and restarting:

```bash
docker compose down
rm -f data/messages.db data/sessions.db
docker compose up -d
```

### Rebuild After Code Changes

After making changes to the codebase, especially to `package.json`, `src/index.js`, `public/js/main.js`, `src/input.css`, `tailwind.config.js`, or the `Dockerfile`, rebuild the Docker image:

```bash
docker compose up --build -d
```

## Next Steps

- **[Usage Guides](usage/)** - Learn how to use the application
- **[Development Guide](development.md)** - Development workflow and tips
- **[API Usage](api-usage.md)** - API endpoints and examples
