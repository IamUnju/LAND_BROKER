# Fix Google OAuth Error 400: redirect_uri_mismatch

## Error Message
```
Error 400: redirect_uri_mismatch
You cannot access this app because it violates Google's OAuth 2.0 policy.

If you are the developer of this app, register the JavaScript origin in Google Cloud Dashboard.
Request details: origin=https://frontend-production-aa5f.up.railway.app flowName=GeneralOAuthFlow
```

---

## Root Cause
Your Google OAuth 2.0 Client ID does not have the frontend domain registered as an authorized origin.

---

## Fix Steps (Google Cloud Console)

### 1. Go to Google Cloud Console
Open: https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
Find and select your project from the dropdown at the top

### 3. Find Your OAuth 2.0 Client ID
- Click on the OAuth 2.0 Client ID: `617365281587-jrg7qi4nn34s0325u5oa5q49kmnuvv1i.apps.googleusercontent.com`
- Click "EDIT" button

### 4. Add Authorized JavaScript Origins
In the "**Authorized JavaScript origins**" section, click "**+ ADD URI**" and add these **EXACTLY**:

```
https://frontend-production-aa5f.up.railway.app
```

Also add for local development:
```
http://localhost:5173
http://localhost:3000
```

### 5. Add Authorized Redirect URIs
In the "**Authorized redirect URIs**" section, click "**+ ADD URI**" and add these **EXACTLY**:

```
https://frontend-production-aa5f.up.railway.app
https://frontend-production-aa5f.up.railway.app/
```

Also add for local development:
```
http://localhost:5173
http://localhost:3000
```

### 6. Save Changes
- Click the blue "**SAVE**" button at the bottom
- Wait 1-5 minutes for Google to propagate changes

### 7. Test Again
- Go to: https://frontend-production-aa5f.up.railway.app/register
- Click "**Continue with Google**"
- Should now work without error

---

## Screenshots Reference

Your OAuth 2.0 Client configuration should look like this:

### Authorized JavaScript origins
```
✓ https://frontend-production-aa5f.up.railway.app
✓ http://localhost:5173
✓ http://localhost:3000
```

### Authorized redirect URIs
```
✓ https://frontend-production-aa5f.up.railway.app
✓ https://frontend-production-aa5f.up.railway.app/
✓ http://localhost:5173
✓ http://localhost:3000
```

---

## Verification Commands

After saving in Google Console, test the configuration:

```powershell
# Check frontend is live
curl https://frontend-production-aa5f.up.railway.app/register

# Check backend OAuth endpoint
curl -X POST https://backend-production-06b1.up.railway.app/api/v1/auth/google -H "Content-Type: application/json" -d "{\"token\":\"test\"}"
```

---

## Current Configuration

**Google Client ID:**
```
617365281587-jrg7qi4nn34s0325u5oa5q49kmnuvv1i.apps.googleusercontent.com
```

**Frontend URL:**
```
https://frontend-production-aa5f.up.railway.app
```

**Backend API URL:**
```
https://backend-production-06b1.up.railway.app
```

**OAuth Implementation:**
- Flow: `implicit` (popup mode)
- UX Mode: `popup`
- Scope: `openid email profile`
- Frontend library: `@react-oauth/google`
- Backend verification: Google userinfo API

---

## Common Issues

### Issue: Still getting error after saving
**Solution:** Wait 5 minutes for Google's cache to clear, then try in incognito/private browser window

### Issue: Works on localhost but not on Railway
**Solution:** Make sure you added the HTTPS Railway URL (not HTTP)

### Issue: "Invalid client" error
**Solution:** Check that `VITE_GOOGLE_CLIENT_ID` environment variable matches the Client ID above

### Issue: Button doesn't show up
**Solution:** 
1. Check `railway variable ls -s frontend` shows `VITE_GOOGLE_CLIENT_ID`
2. Redeploy frontend: `railway up ./frontend --detach --path-as-root -s frontend`

---

## Testing Checklist

After configuration:

- [ ] Saved authorized origins in Google Console
- [ ] Saved authorized redirect URIs in Google Console
- [ ] Waited 5 minutes for propagation
- [ ] Tested in incognito browser window
- [ ] Clicked "Continue with Google" on register page
- [ ] Google consent screen appears
- [ ] After consent, redirects back and creates account
- [ ] User is logged in as TENANT
- [ ] Redirected to tenant dashboard

---

## Support Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [React OAuth Google Package](https://www.npmjs.com/package/@react-oauth/google)

---

## Questions?

If you're still getting errors after following these steps:

1. Check browser console (F12) for JavaScript errors
2. Check Railway backend logs: `railway logs -s backend`
3. Check Railway frontend logs: `railway logs -s frontend`
4. Verify Client ID in Railway: `railway variable ls -s frontend | Select-String "GOOGLE"`
