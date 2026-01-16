# Private Invitation Access Guide

This guide explains how the private invitation access system works in BlackPulse, and how to configure it for your community.

## Overview

BlackPulse can be configured as a private, invitation-only community. When enabled, all visitors must verify their invitation code before accessing any content. The system preserves URL parameters (such as private message keys) and redirects users to their intended destination after verification.

## For Visitors: Accessing a Private Board

### First-Time Access

1. Navigate to the board URL (e.g., `https://message.goldie-rill.top/`)
2. You'll be automatically redirected to the invitation verification page
3. Enter your invitation code (e.g., `8964`)
4. Click "Verify Access"
5. If the code is correct, you'll be redirected to the page you originally wanted to visit

### Accessing with a Private Key

If someone shares a private message link with you (e.g., `https://message.goldie-rill.top/?key=100`):

1. Click the link
2. You'll be redirected to the invitation verification page
3. Enter your invitation code
4. After verification, you'll be redirected to the original private message with the key parameter intact

### Subsequent Visits

Once you've verified your invitation code:
- Your verification is stored in a session cookie
- You can access the site directly without re-entering the code
- Verification persists until:
  - Your session expires
  - You close your browser
  - You clear your browser cookies

## For Administrators: Configuration

### Setting the Invitation Mode and Code

The invitation system is configured in the `.env` file in the project root:

```env
# Enable invitation access (required for private mode)
INVITATION_MODE=true

# Set the invitation code
INVITATION_CODE=your-secret-code-here
```

**Default values**:
- `INVITATION_MODE`: `false` (public access)
- `INVITATION_CODE`: Must be set in `.env` when `INVITATION_MODE=true`

### Enabling Invitation Access

To make your board private and require an invitation code:

1. Open the `.env` file in a text editor
2. Add or set these lines:
   ```env
   INVITATION_MODE=true
   INVITATION_CODE=your-secret-code
   ```
3. Save the file
4. Restart the Docker container:
   ```bash
   docker compose up --build -d
   ```

### Changing the Invitation Code

1. Open the `.env` file in a text editor
2. Find the line `INVITATION_CODE=8964`
3. Replace `8964` with your desired code
4. Save the file
5. Restart the Docker container:
   ```bash
   docker compose up --build -d
   ```

### Disabling Invitation Requirement (Making the Site Public)

To make your board publicly accessible without requiring an invitation code:

**Option 1: Set mode to false**
```env
INVITATION_MODE=false
```

**Option 2: Remove the INVITATION_MODE line entirely**
Delete the `INVITATION_MODE=true` line from the `.env` file

Then restart the container:
```bash
docker compose up --build -d
```

**Note**: You can keep `INVITATION_CODE` set even when `INVITATION_MODE=false`. The code will be preserved but not used until you enable `INVITATION_MODE=true` again.

### Security Best Practices

1. **Keep the code secret**: Only share it with trusted individuals
2. **Change it periodically**: Update the code regularly for better security
3. **Use a strong code**: Choose a code that's not easily guessable
4. **Don't commit to version control**: The `.env` file should be in `.gitignore`
5. **Communicate securely**: Share the code through secure channels (encrypted messaging, in person, etc.)

## How It Works

### Technical Details

- **Middleware**: The `requireInvitation` middleware checks every request (except API routes and static assets)
- **Mode Control**: Only active when `INVITATION_MODE=true` in environment variables
- **Session Storage**: Verification status is stored in a server-side session, not accessible to clients
- **URL Preservation**: The original URL (including query parameters) is preserved and restored after verification
- **Graceful Degradation**: If `INVITATION_MODE` is not set to `true`, the site operates normally (public access)

### Access Flow

```
User visits any URL
    ↓
Middleware checks session.invitationVerified
    ↓
If not verified → Redirect to /invite?redirect=<original_url>
    ↓
User enters invitation code
    ↓
POST /api/invite/verify
    ↓
Server validates code
    ↓
If valid → Set session.invitationVerified = true
    ↓
Redirect to original URL
```

## Troubleshooting

### I entered the correct code but it says "Invalid invitation code"

- Check for extra spaces before or after the code
- Make sure Caps Lock is off (codes are case-sensitive)
- Verify the code with the administrator
- Try clearing your browser cache and cookies

### I keep getting redirected to the invitation page

- Make sure cookies are enabled in your browser
- Check if your browser is blocking session cookies
- Try using a different browser or incognito/private mode
- Verify that the administrator hasn't changed the code

### I want to share a private message with someone

1. Share the full URL including the key (e.g., `https://message.goldie-rill.top/?key=100`)
2. Also share the invitation code separately
3. The recipient will need both the URL and the invitation code to access the content

### How do I know if invitation access is enabled?

- If you see an invitation verification page when you first visit, it's enabled
- If you can access the site directly without entering a code, it's disabled or already verified

## Example Scenarios

### Scenario 1: Private Community Board

**Setup**: Set a secret invitation code in `.env`
**Use Case**: Create a private space for a specific group of people
**Sharing**: Share the code only with trusted community members

### Scenario 2: Temporary Access Control

**Setup**: Set an invitation code, change it periodically
**Use Case**: Event-based access, seasonal access, or temporary closures
**Management**: Change the code when access needs to be revoked

### Scenario 3: Public Board

**Setup**: Leave `INVITATION_CODE` empty in `.env`
**Use Case**: Open community, public discussions
**Access**: Anyone can visit without entering a code

## FAQ

**Q: Do I need to enter the code every time?**
A: No, your verification persists in your session until you close your browser or the session expires.

**Q: Can I have different invitation codes for different users?**
A: Currently, no. There's a single invitation code for the entire board. All verified users share the same code.

**Q: What happens if I forget the code?**
A: Contact the board administrator. The code can be viewed in the `.env` file on the server.

**Q: Is the invitation code encrypted?**
A: The code is stored in plain text in the `.env` file on the server. It's compared securely server-side, and verification status is stored in the session.

**Q: Can I bypass the invitation check?**
A: No, the middleware applies to all routes (except API routes and static assets). There's no way to access the main content without verification.

**Q: Does this affect API access?**
A: No, API routes are excluded from the invitation check. This allows external tools and integrations to work normally.
