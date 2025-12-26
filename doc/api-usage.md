# API Usage with curl

You can interact with the message board API directly using `curl` commands. This is useful for testing, automation, or integration with other tools.

## Basic Message Operations

### 1. Get all public messages

```bash
curl -s "http://localhost:1989/api/messages"
```

### 2. Get trending messages

```bash
curl -s "http://localhost:1989/api/messages/trending"
```

### 3. Get liked messages (requires authentication)

```bash
curl -s "http://localhost:1989/api/messages/liked" -b cookies.txt
```

### 4. Post a public message

```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Your message here\"}"
```

### 5. Post a private message with KEY

```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Secret message\", \"isPrivate\": true, \"privateKey\": \"your-secret-key\"}"
```

### 6. View private messages with KEY

```bash
curl -s "http://localhost:1989/api/messages?privateKey=your-secret-key"
```

### 7. Get messages with pagination

```bash
# Get page 1 (default, 5 messages per page)
curl -s "http://localhost:1989/api/messages?page=1&limit=5"

# Get page 2 with private key
curl -s "http://localhost:1989/api/messages?page=2&limit=5&privateKey=your-secret-key"

# Get page 3 as logged-in user (with session cookie)
curl -s "http://localhost:1989/api/messages?page=3&limit=5" -b cookies.txt
```

## User Authentication API

### 1. Register a new user

```bash
curl -s -X POST "http://localhost:1989/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"password123\"}"
```

### 2. Login (creates a session cookie)

```bash
curl -s -X POST "http://localhost:1989/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"password123\"}" \
  -c cookies.txt
```

### 3. Get current user info (with session cookie)

```bash
curl -s "http://localhost:1989/api/auth/me" \
  -b cookies.txt
```

### 4. Logout

```bash
curl -s -X POST "http://localhost:1989/api/auth/logout" \
  -b cookies.txt
```

## File Upload API

### 1. Upload a file (any type)

```bash
curl -s -X POST "http://localhost:1989/api/upload-file" \
  -F "file=@/path/to/your/file.pdf" \
  -H "Content-Type: multipart/form-data"
```

### 2. Post a message with file (two-step process)

```bash
# Step 1: Upload the file
curl -s -X POST "http://localhost:1989/api/upload-file" \
  -F "file=@/path/to/your/file.pdf" \
  -H "Content-Type: multipart/form-data" \
  -o upload-response.json

# Step 2: Post message with file reference
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "content": "Message with file",
  "hasImage": true,
  "imageFilename": "$(jq -r '.filename' upload-response.json)",
  "imageMimeType": "$(jq -r '.mimeType' upload-response.json)",
  "imageSize": $(jq -r '.size' upload-response.json)
}
EOF
)"
```

### 3. Post private message with file

```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Private file message\", \"isPrivate\": true, \"privateKey\": \"secret123\", \"hasImage\": true, \"imageFilename\": \"1734267890123_abc123_document.pdf\", \"imageMimeType\": \"application/pdf\", \"imageSize\": 512000}"
```

### 4. Backward compatibility - Upload an image using the original endpoint

```bash
curl -s -X POST "http://localhost:1989/api/upload" \
  -F "image=@/path/to/your/image.jpg" \
  -H "Content-Type: multipart/form-data"
```

## Advanced Examples

### 1. Post message as logged-in user (with session cookie)

```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Message from logged-in user\"}" \
  -b cookies.txt
```

### 2. Post private message as logged-in user (auto-generates KEY)

```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Private message from user\", \"isPrivate\": true}" \
  -b cookies.txt
```

### 3. Get messages for logged-in user (shows user's private messages)

```bash
curl -s "http://localhost:1989/api/messages" \
  -b cookies.txt
```

### 4. Like/Unlike a message (requires authentication)

```bash
curl -s -X POST "http://localhost:1989/api/messages/1/like" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## Comments API

### 1. Get comments for the current page

```bash
curl -s "http://localhost:1989/api/comments?url=http://localhost:1989"
```

### 2. Get comments with pagination

```bash
curl -s "http://localhost:1989/api/comments?url=http://localhost:1989&page=1&limit=10"
```

### 3. Post a new comment

```bash
curl -s -X POST "http://localhost:1989/api/comments" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"This is a great post!\", \"url\": \"http://localhost:1989\"}"
```

### 4. Post a reply to an existing comment

```bash
curl -s -X POST "http://localhost:1989/api/comments" \
  -H "Content-Type: application/json" \
  -d "{\"pid\": \"123\", \"text\": \"I agree with you.\", \"url\": \"http://localhost:1989\"}"
```

### 5. Edit your own comment

```bash
curl -s -X PUT "http://localhost:1989/api/comments/123" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Updated comment text\"}"
```

### 6. Delete your own comment

```bash
curl -s -X DELETE "http://localhost:1989/api/comments/123"
```

### 7. Like/Unlike a comment

```bash
curl -s -X POST "http://localhost:1989/api/comments/123/like" \
  -H "Content-Type: application/json"
```

### 8. Get comments for a specific page

```bash
curl -s "http://localhost:1989/api/comments?url=http://localhost:1989/specific-page"
```

## Response Format Examples

### Successful message post response

```json
{
  "id": 5,
  "content": "Your message",
  "timestamp": "2025-12-12 14:04:51",
  "is_private": 0,
  "private_key": null,
  "user_id": null,
  "has_image": 0,
  "image_filename": null,
  "image_mime_type": null,
  "image_size": null
}
```

### Image message post response

```json
{
  "id": 6,
  "content": "Check out this image!",
  "timestamp": "2025-12-15 15:30:45",
  "is_private": 0,
  "private_key": null,
  "user_id": null,
  "has_image": 1,
  "image_filename": "1734267890123_abc123_image.jpg",
  "image_mime_type": "image/jpeg",
  "image_size": 102400
}
```

### Image upload response

```json
{
  "success": true,
  "filename": "1734267890123_abc123_image.jpg",
  "originalName": "myphoto.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "url": "/uploads/1734267890123_abc123_image.jpg"
}
```

### Messages list response (with pagination)

```json
{
  "messages": [
    {
      "id": 1,
      "content": "Public message",
      "timestamp": "2025-12-12 14:03:29",
      "is_private": 0,
      "private_key": null,
      "user_id": null,
      "has_image": 0,
      "image_filename": null,
      "image_mime_type": null,
      "image_size": null
    },
    {
      "id": 2,
      "content": "Message with image",
      "timestamp": "2025-12-15 15:35:20",
      "is_private": 0,
      "private_key": null,
      "user_id": null,
      "has_image": 1,
      "image_filename": "1734267890123_abc123_image.jpg",
      "image_mime_type": "image/jpeg",
      "image_size": 102400
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 42,
    "totalPages": 9,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "hasPrivateMessages": false,
  "privateKeyProvided": false,
  "userId": null
}
```

## Tips

- Use `-s` flag for silent mode (no progress meter)
- Use `-v` flag for verbose output to see request/response headers
- Save cookies with `-c cookies.txt` and reuse with `-b cookies.txt`
- For Windows PowerShell, use double quotes and escape inner quotes with backtick (`)
- For Windows CMD, use double quotes and escape inner quotes with backslash (\\)

## Examples in Other Languages

Examples using JavaScript (fetch/axios), Python (requests/aiohttp), and Node.js follow the same patterns as the curl examples above. Use `credentials: 'include'` or session handling for authentication.
