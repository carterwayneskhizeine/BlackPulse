# Password Change Guide

This guide explains how logged-in users can change their password in BlackPulse.

## Changing Your Password

### Step 1: Access the User Menu

1. Log in to your account
2. Click on your username in the top-right corner of the header
3. A dropdown menu will appear with two options:
   - **Change Password** (key icon)
   - **Logout** (logout icon)

### Step 2: Open Change Password Modal

Click on the "Change Password" option in the dropdown menu. A modal will appear with three input fields.

### Step 3: Enter Your Passwords

Fill in the following fields:

1. **Current Password**: Enter your existing password
2. **New Password**: Enter your new password (minimum 6 characters)
3. **Confirm New Password**: Re-enter your new password to confirm

### Step 4: Submit

Click the "Change Password" button to submit.

- **Success**: A green success message will appear, and the modal will automatically close after 1.5 seconds
- **Error**: A red error message will appear indicating the issue (see Troubleshooting below)

## Password Requirements

- **Minimum Length**: 6 characters
- **Confirmation**: New password must match the confirmation field
- **Current Password**: Must be verified before allowing the change

## Troubleshooting

### Common Error Messages

**"All fields are required"**
- Make sure all three fields (current password, new password, confirm password) are filled in

**"New passwords do not match"**
- The new password and confirmation don't match. Check for typos and try again

**"New password must be at least 6 characters"**
- Your new password is too short. Choose a password with 6 or more characters

**"Current password is incorrect"**
- The current password you entered doesn't match your actual password. Try again

**"Not authenticated"**
- Your session has expired. Log out and log back in, then try again

**"Network error, please try again"**
- There was a connection issue. Check your internet connection and try again

## Security Notes

- Your session remains active after changing your password (you stay logged in)
- Passwords are securely hashed using bcrypt before storage
- The current password must be verified before allowing any changes
- Password requirements are enforced both on the client and server side

## Tips

- Choose a strong, unique password that you don't use elsewhere
- Consider using a password manager to generate and store secure passwords
- After changing your password, you'll need to use the new password on your next login
- The old password will no longer work after a successful change
