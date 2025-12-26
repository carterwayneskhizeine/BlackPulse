# Development Guide

This guide covers the development workflow for the BlackPulse project.

## Development Workflow

If you make changes to the code, especially to `package.json`, `src/index.js`, `public/js/main.js`, `src/input.css`, `tailwind.config.js`, or the `Dockerfile`, you will need to rebuild the Docker image to apply these changes:

```bash
docker compose up --build -d
```

This ensures that any new dependencies are installed, CSS is recompiled, and your latest code is included in the running container.

**Note:** This command is typically used after making code changes that affect the application's dependencies or build process.

## Viewing Logs

To view the application logs:

```bash
docker compose logs -f message-board
```

Use `-f` flag to follow the logs in real-time.

## Stopping and Starting Containers

### Stop containers

```bash
docker compose down
```

### Start containers

```bash
docker compose up -d
```

### Restart containers

```bash
docker compose restart message-board
```

## Development Tips

### Hot Reloading

The application does not currently support hot reloading. After making changes to frontend JavaScript or CSS files, you need to:

1. Rebuild the container: `docker compose up --build -d`
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Testing API Changes

Use the provided [API documentation](api-usage.md) to test API endpoints with curl:

```bash
# Test messages endpoint
curl -s "http://localhost:1989/api/messages"

# Test posting a message
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

### Database Access

To access the SQLite database directly:

```bash
# Enter the container
docker compose exec message-board sh

# Open the database
sqlite3 data/messages.db

# Run SQL queries
.schema messages
SELECT * FROM messages LIMIT 5;

# Exit
.exit
```

## File Changes Impact

### Frontend Changes

Files requiring rebuild:
- `public/js/*.js` - Any JavaScript files
- `src/input.css` - Tailwind CSS input
- `tailwind.config.js` - Tailwind configuration
- `views/*.ejs` - EJS templates

### Backend Changes

Files requiring rebuild:
- `src/**/*.js` - Any backend JavaScript files
- `package.json` - Dependencies

### Configuration Changes

Files requiring rebuild:
- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Container orchestration

## Code Style

### JavaScript

- Use ES6+ features (async/await, arrow functions, etc.)
- Follow modular architecture with ES Modules (import/export)
- Use meaningful variable and function names

### CSS

- Use Tailwind utility classes
- Follow BEM naming for custom CSS classes
- Maintain dark mode consistency

### Database

- Use parameterized queries to prevent SQL injection
- Create indexes for frequently queried columns
- Use transactions for multi-step operations

## Debugging

### Enable Debug Logging

To enable more verbose logging, modify the relevant route handlers to add console.log statements:

```javascript
console.log('Debug info:', { variable1, variable2 });
```

Then rebuild and check the logs:

```bash
docker compose logs -f message-board | grep "Debug info"
```

### Browser Developer Tools

1. Open browser DevTools (F12)
2. Check the Console tab for frontend errors
3. Use the Network tab to inspect API requests
4. Use the Application tab to view local storage and cookies

## Common Issues

### Port Already in Use

If port 1989 is already in use:

```bash
# Find process using port 1989
netstat -ano | findstr :1989  # Windows
lsof -i :1989                 # Linux/Mac

# Kill the process or change port in docker-compose.yml
```

### Container Won't Start

1. Check logs: `docker compose logs message-board`
2. Check for port conflicts
3. Try rebuilding: `docker compose up --build -d`
4. Check Docker is running: `docker ps`

### Database Lock Errors

1. Stop the containers: `docker compose down`
2. Wait a few seconds
3. Restart: `docker compose up -d`

### Changes Not Reflected

1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Rebuild container: `docker compose up --build -d`
4. Check for cached JavaScript files

## Contributing

When contributing to the project:

1. Create a new branch for your feature
2. Make your changes following the code style guidelines
3. Test thoroughly with `docker compose up --build -d`
4. Update documentation as needed
5. Submit a pull request with clear description

## Performance Optimization

### Database Optimization

- Add indexes for frequently queried columns
- Use LIMIT for pagination
- Avoid N+1 query problems

### Frontend Optimization

- Minimize DOM manipulations
- Use event delegation for dynamic content
- Lazy load images and videos
- Implement debouncing for search input

### Container Optimization

- Use Alpine Linux for smaller image size
- Minimize installed dependencies
- Use multi-stage builds if applicable

## Resources

- **[Installation Guide](installation.md)** - Set up your development environment
- **[API Usage](api-usage.md)** - API endpoints and examples
- **[Feature Implementations](feature-implementations.md)** - Technical details of features
- **[Database Management](database-management.md)** - Database operations and maintenance
