# Database Management

This guide covers database operations and maintenance for the BlackPulse application.

## Database Files

The application uses two SQLite database files stored in the `./data/` directory:

1. **`messages.db`** - Stores all messages (public and private), users, and comments
2. **`sessions.db`** - Stores user session data

Additionally, uploaded files (images and other types) are stored in the `./data/uploads/` directory.

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_private INTEGER DEFAULT 0,
    private_key TEXT,
    user_id INTEGER,
    has_image INTEGER DEFAULT 0,
    image_filename TEXT,
    image_mime_type TEXT,
    image_size INTEGER,
    likes INTEGER DEFAULT 0,
    likers TEXT,  -- JSON array of user IDs
    comment_count INTEGER DEFAULT 0,
    hot_score REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Comments Table

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    url TEXT NOT NULL,
    user_id INTEGER,
    parent_id INTEGER,  -- For nested replies
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    likers TEXT,  -- JSON array of user IDs
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);
```

## Database Indexes

The following indexes are created for performance optimization:

```sql
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_is_private ON messages(is_private);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_private_key ON messages(private_key);
CREATE INDEX idx_messages_has_image ON messages(has_image);
CREATE INDEX idx_messages_hot_score ON messages(hot_score DESC);
CREATE INDEX idx_users_username ON users(username);
```

## Clearing the Database

### Method 1: Stop containers and delete files (Recommended)

```bash
# Stop the running containers
docker compose down

# Delete the database files and uploaded images
rm -f data/messages.db data/sessions.db
rm -rf data/uploads/*

# Restart the containers (new databases will be created automatically)
docker compose up -d
```

### Method 2: Delete files while containers are running

```bash
# Delete the database files and uploaded images
rm -f data/messages.db data/sessions.db
rm -rf data/uploads/*

# Restart the application container to recreate databases
docker compose restart message-board
```

### Method 3: Using a one-liner command

```bash
docker compose down && rm -f data/messages.db data/sessions.db && rm -rf data/uploads/* && docker compose up -d
```

**Important Notes**:
- Deleting `sessions.db` will log out all users
- Deleting `messages.db` will remove ALL messages permanently
- Deleting files in `data/uploads/` will remove ALL uploaded files
- The application will automatically create new empty databases when restarted
- User accounts are stored in `messages.db`, so deleting it will also remove all user accounts

## Database Access

### Accessing SQLite Directly

```bash
# Enter the container
docker compose exec message-board sh

# Open the database
sqlite3 data/messages.db

# Run SQL queries
.schema                    -- Show database schema
.tables                    -- List all tables
SELECT * FROM messages;    -- View all messages
SELECT * FROM users;       -- View all users
SELECT * FROM comments;    -- View all comments

# Exit
.exit
```

### Useful SQL Queries

```sql
-- Count total messages
SELECT COUNT(*) FROM messages;

-- Count public vs private messages
SELECT is_private, COUNT(*) FROM messages GROUP BY is_private;

-- View messages with files
SELECT id, content, image_filename FROM messages WHERE has_image = 1;

-- View top liked messages
SELECT id, content, likes FROM messages ORDER BY likes DESC LIMIT 10;

-- View user statistics
SELECT username, created_at FROM users ORDER BY created_at DESC;

-- View comment count per message
SELECT id, content, comment_count FROM messages ORDER BY comment_count DESC LIMIT 10;

-- View trending messages
SELECT id, content, hot_score FROM messages ORDER BY hot_score DESC LIMIT 10;

-- Find orphaned files (files in uploads but not in database)
SELECT image_filename FROM messages WHERE has_image = 1;
```

## Database Backup

### Backup Database

```bash
# Stop the container to ensure consistent backup
docker compose stop message-board

# Copy database files
cp data/messages.db data/messages.db.backup
cp data/sessions.db data/sessions.db.backup

# Copy uploaded files
cp -r data uploads uploads.backup

# Restart container
docker compose start message-board
```

### Backup with Timestamp

```bash
# Create timestamped backup
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
docker compose stop message-board
cp data/messages.db "data/messages_${BACKUP_DATE}.db"
cp data/sessions.db "data/sessions_${BACKUP_DATE}.db"
tar -czf "uploads_${BACKUP_DATE}.tar.gz" data/uploads/
docker compose start message-board
```

### Restore Database

```bash
# Stop the container
docker compose stop message-board

# Restore from backup
cp data/messages.db.backup data/messages.db
cp data/sessions.db.backup data/sessions.db
rm -rf data/uploads/*
tar -xzf uploads_backup.tar.gz -C data/

# Restart container
docker compose start message-board
```

## Database Maintenance

### Vacuum Database

Optimize database file size and defragment:

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db 'VACUUM;'"
docker compose exec message-board sh -c "sqlite3 data/sessions.db 'VACUUM;'"
```

### Analyze Database

Update statistics for query optimization:

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db 'ANALYZE;'"
docker compose exec message-board sh -c "sqlite3 data/sessions.db 'ANALYZE;'"
```

### Rebuild Indexes

Rebuild all indexes for better performance:

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db 'REINDEX;'"
docker compose exec message-board sh -c "sqlite3 data/sessions.db 'REINDEX;'"
```

## Data Migration

### Export Data to SQL

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db '.dump messages'" > messages_dump.sql
docker compose exec message-board sh -c "sqlite3 data/messages.db '.dump users'" > users_dump.sql
docker compose exec message-board sh -c "sqlite3 data/messages.db '.dump comments'" > comments_dump.sql
```

### Import Data from SQL

```bash
# Copy SQL file to container
docker cp messages_dump.sql message-board:/tmp/

# Import into database
docker compose exec message-board sh -c "sqlite3 data/messages.db < /tmp/messages_dump.sql"
```

### Export to CSV

```bash
docker compose exec message-board sh -c "sqlite3 -header -csv data/messages.db 'SELECT * FROM messages;'" > messages.csv
docker compose exec message-board sh -c "sqlite3 -header -csv data/messages.db 'SELECT * FROM users;'" > users.csv
```

## Troubleshooting

### Database Locked Error

If you get "database is locked" error:

```bash
# Restart the container
docker compose restart message-board

# Or stop all processes and wait
docker compose down
sleep 5
docker compose up -d
```

### Corrupted Database

If database is corrupted:

```bash
# Try to recover data
docker compose exec message-board sh -c "sqlite3 data/messages.db '.recover' | sqlite3 data/messages_recovered.db"

# If recovery fails, restore from backup
cp data/messages.db.backup data/messages.db
```

### Disk Space Issues

Check database size:

```bash
docker compose exec message-board sh -c "ls -lh data/"
```

Free up space by deleting old data or running VACUUM.

## Monitoring

### Check Database Size

```bash
docker compose exec message-board sh -c "du -sh data/messages.db data/sessions.db data/uploads/"
```

### Check Table Counts

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db 'SELECT \"messages:\" || COUNT(*) FROM messages UNION SELECT \"users:\" || COUNT(*) FROM users UNION SELECT \"comments:\" || COUNT(*) FROM comments;'"
```

### Monitor Performance

Enable SQLite query timing:

```bash
docker compose exec message-board sh -c "sqlite3 data/messages.db '.timer on' 'SELECT * FROM messages LIMIT 10;'"
```

## Security Considerations

- Database files contain sensitive user information (password hashes)
- Always use parameterized queries to prevent SQL injection
- Regular backups are essential for data protection
- Limit database file permissions (handled automatically by Docker)
- Consider encrypting backups if storing them externally
- Never commit database files to version control

## Resources

- **[Development Guide](development.md)** - Development workflow
- **[Project Structure](project-structure.md)** - Database schema details
- **[Feature Implementations](feature-implementations.md)** - Database optimization features
