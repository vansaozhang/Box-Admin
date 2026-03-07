# Box Admin Authentication Setup

## Overview

The Box Admin panel uses a secure authentication system that connects to the subscription-backend API. This is an **admin-only** interface - users must be created through the backend API and cannot self-register through the admin panel.

## Features

- ✅ Secure JWT-based authentication
- ✅ Protected routes with middleware
- ✅ Persistent login sessions (localStorage)
- ✅ User profile display with initials
- ✅ Logout functionality
- ✅ Automatic redirect to login for unauthenticated users

## How It Works

### 1. Authentication Flow

1. Admin navigates to `/login`
2. Enters email and password
3. System authenticates against backend API (`POST /auth/login`)
4. On success:
   - JWT token is stored in localStorage
   - User object is stored in localStorage
   - User is redirected to dashboard
5. All subsequent API calls include the JWT token

### 2. Protected Routes

All pages except `/login` are protected by the `auth` middleware. If a user tries to access a protected page without being logged in, they're automatically redirected to the login page.

Protected pages:
- `/` - Dashboard
- `/users` - User management
- `/settings` - Settings
- `/security/*` - All security pages

### 3. Creating Admin Users

Since there's no registration page, admin users must be created through the backend API:

**Using the API directly:**

```bash
curl -X POST https://subscription-backend-528466251837.us-central1.run.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@box.com",
    "password": "SecurePassword123"
  }'
```

**Or add users directly to the database**

### 4. API Configuration

The frontend connects to the backend API at `https://subscription-backend-528466251837.us-central1.run.app/api` (same as the Android app). To change this:

1. Set the `API_BASE_URL` environment variable:
   ```bash
   export API_BASE_URL=https://api.yourbox.com
   ```

2. Or update the hardcoded value in `composables/useAuth.ts`:
   ```typescript
   const API_BASE_URL = 'https://api.yourbox.com'
   ```

## File Structure

```
BoxAdmin/
├── composables/
│   └── useAuth.ts              # Authentication logic & API calls
├── middleware/
│   └── auth.ts                 # Route protection middleware
├── pages/
│   ├── login.vue               # Login page
│   ├── index.vue              # Dashboard (protected)
│   ├── users.vue              # User management (protected)
│   └── settings.vue           # Settings (protected)
├── plugins/
│   └── auth.ts                # Initialize auth state on app load
└── app.vue                     # Main layout with logout functionality
```

## Usage

### Login

1. The backend is already deployed at: `https://subscription-backend-528466251837.us-central1.run.app/api`
2. Start the frontend: `cd BoxAdmin && npm run dev`
3. Navigate to `http://localhost:3001` (auto-redirects to login)
4. Enter credentials and click "Sign In"

### Logout

Click on the user avatar in the top-right corner and select "Logout"

## Security Notes

- Passwords are sent securely to the backend (use HTTPS in production)
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Tokens expire after 60 minutes (configurable in backend)
- No sensitive data is stored in the frontend beyond the token

## Troubleshooting

**Issue: Can't login**

- Verify backend is deployed and accessible
- Check console for API errors
- Ensure user exists in database

**Issue: Auto-logged out**

- Token may have expired (60min default)
- Check if backend is still accessible

**Issue: Redirected to login on page refresh**

- Check browser console for errors
- Verify localStorage contains `auth_token` and `auth_user`
- Clear localStorage and try logging in again

## Future Enhancements

- [ ] Add "Remember Me" functionality
- [ ] Add password reset flow
- [ ] Add session timeout warning
- [ ] Add refresh token mechanism
- [ ] Add role-based access control (RBAC) to frontend
