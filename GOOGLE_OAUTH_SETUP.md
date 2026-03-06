# Google OAuth Setup Guide

## Configuration Completed ✅

Google OAuth has been configured for BrokerSaaS on both frontend and backend.

### Client ID
```
617365281587-jrg7qi4nn34s0325u5oa5q49kmnuvv1i.apps.googleusercontent.com
```

### Deployed Configuration

**Frontend Service:**
- Environment Variable: `VITE_GOOGLE_CLIENT_ID`
- Value: `617365281587-jrg7qi4nn34s0325u5oa5q49kmnuvv1i.apps.googleusercontent.com`
- Baked into build at: `/frontend/src/main.jsx`

**Backend Service:**
- Environment Variable: `GOOGLE_CLIENT_ID`
- Value: `617365281587-jrg7qi4nn34s0325u5oa5q49kmnuvv1i.apps.googleusercontent.com`
- Endpoint: `POST /api/v1/auth/google`

### How It Works

#### Registration Flow with Google
1. User visits `/register` page
2. Clicks "Continue with Google" button
3. Google OAuth consent dialog opens
4. User authorizes BrokerSaaS to access email & profile
5. Frontend receives Google access token
6. Frontend sends token to `POST /api/v1/auth/google`
7. Backend verifies token with Google's userinfo endpoint
8. If new user:
   - Creates account with TENANT role
   - Email auto-verified
   - Sets random secure password
9. Returns JWT tokens (access + refresh)
10. Frontend stores in localStorage
11. User redirected to tenant dashboard

#### Implementation Details

**Frontend (React):**
- File: [frontend/src/presentation/pages/auth/RegisterPage.jsx](frontend/src/presentation/pages/auth/RegisterPage.jsx)
- Uses: `@react-oauth/google` library
- Hook: `useGoogleLogin()` from context

**Backend (FastAPI):**
- File: [backend/app/presentation/api/auth_router.py](backend/app/presentation/api/auth_router.py)
- Endpoint: `POST /api/v1/auth/google`
- Uses: `httpx` to verify token with Google
- Role: Auto-assigns TENANT role to new users

**Auth Context:**
- File: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- Function: `googleAuth(accessToken)`
- Handles: Token storage, user loading, redirection

### Testing

1. Visit: https://frontend-production-aa5f.up.railway.app/register
2. Click "Continue with Google"
3. Sign in with your Google account
4. Account created automatically as TENANT
5. Redirected to tenant dashboard

### Authorized Domains

Configured in Google Cloud Console:

**JavaScript Origins:**
- https://frontend-production-aa5f.up.railway.app
- http://localhost:3000
- http://localhost:5173

**Redirect URIs:**
- https://frontend-production-aa5f.up.railway.app
- https://frontend-production-aa5f.up.railway.app/login
- https://frontend-production-aa5f.up.railway.app/register
- http://localhost:3000
- http://localhost:5173

### Troubleshooting

#### "Continue with Google" button not showing
- Check if `VITE_GOOGLE_CLIENT_ID` is set in Railway frontend service
- Rebuild frontend: `railway up ./frontend`

#### "Invalid Google token" error
- Backend can't verify token with Google
- Check if GoogleOAuthProvider is wrapping the app in main.jsx
- Verify Client ID is correct

#### Token verification fails
- Google's userinfo endpoint returned error
- Check Google Cloud Console OAuth settings
- Verify domain is authorized

### Next Steps

1. ✅ Google Client ID configured
2. ✅ Frontend & Backend deployed
3. Test Google OAuth flow on register page
4. Consider adding Google login on login page (same flow)
5. Add Google logout handling (revoke tokens)
