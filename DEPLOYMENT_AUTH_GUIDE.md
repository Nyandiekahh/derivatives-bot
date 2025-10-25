# Deriv Bot Authentication & Deployment Guide

## 🔐 Understanding the Authentication Flow

This Deriv Bot uses a **custom OAuth2-style flow** that's different from the standard Deriv API OAuth documented at https://developers.deriv.com/docs/oauth.

### Current Authentication Architecture

The app uses **TWO different authentication methods**:

1. **Primary Method**: Custom brand-based OAuth (via `brand.config.json`)
   - Redirects to `https://home.deriv.com/dashboard/login` (production)
   - Or `https://staging-home.deriv.com/dashboard/login` (staging)
   - This is NOT the standard Deriv API OAuth endpoint

2. **Fallback Method**: Standard Deriv API OAuth
   - Uses `https://oauth.deriv.com/oauth2/authorize?app_id=YOUR_APP_ID`
   - Only used in specific conditions (see `login.ts`)

## 🎯 Your App Configuration

| Setting | Value |
|---------|-------|
| **App ID** | 107518 |
| **Redirect URL** | https://derivatives-bot-delta.vercel.app/ |
| **Current Deployment** | https://derivatives-isada6sng-nyandiekas-projects.vercel.app |

## ⚠️ Current Issues

### 1. OAuth Redirect URL Mismatch
- **Registered redirect URL**: `https://derivatives-bot-delta.vercel.app/`
- **Actual deployment URL**: `https://derivatives-isada6sng-nyandiekas-projects.vercel.app`
- **Result**: OAuth callback fails because the URLs don't match

### 2. Custom OAuth Flow vs Standard Deriv API
The app currently uses `brand.config.json` which redirects to `home.deriv.com/dashboard/login`, **not** the standard Deriv API OAuth endpoint.

## ✅ Solution Options

### Option A: Use Your Registered Domain (Recommended)

1. **Add your custom domain to Vercel**:
   ```bash
   # In Vercel dashboard:
   # Project Settings → Domains → Add Domain
   # Add: derivatives-bot-delta.vercel.app
   ```

2. **Set environment variable in Vercel**:
   ```
   VITE_APP_ID=107518
   ```

3. **Redeploy** - The app will now match your registered redirect URL

### Option B: Update Deriv API App Registration

1. Go to https://api.deriv.com/dashboard
2. Click on your app (ID: 107518)
3. Update the **Redirect URL** to:
   ```
   https://derivatives-isada6sng-nyandiekas-projects.vercel.app/
   ```
4. Save and redeploy your app

### Option C: Switch to Standard Deriv API OAuth (Most Compatible)

This requires code changes to use the standard OAuth flow documented at https://developers.deriv.com/docs/oauth.

## 📋 Step-by-Step Setup (Option A - Recommended)

### 1. Configure Vercel Domain

```bash
# Login to Vercel
vercel login

# Link to your project
vercel link

# Add domain (in Vercel dashboard or CLI)
vercel domains add derivatives-bot-delta.vercel.app
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
VITE_APP_ID=107518

# Optional but recommended:
APP_ENV=production
REF_NAME=main
REMOTE_CONFIG_URL=<your-firebase-config-url>
RUDDERSTACK_KEY=<your-rudderstack-key>
DATADOG_APPLICATION_ID=<your-datadog-app-id>
DATADOG_CLIENT_TOKEN=<your-datadog-token>
```

### 3. Verify Deriv API App Settings

1. Visit https://api.deriv.com/dashboard
2. Find your app (ID: 107518)
3. Confirm these settings:
   - **App ID**: 107518
   - **Redirect URL**: `https://derivatives-bot-delta.vercel.app/` (or your chosen domain)
   - **OAuth Details**: Correctly configured

### 4. Deploy

```bash
# Trigger a new deployment
vercel --prod

# Or push to GitHub if you have Vercel integration
git push origin master
```

## 🔍 How the Authentication Works

### Flow Diagram

```
User clicks "Login" 
    ↓
App redirects to OAuth provider
    ↓
User logs in with Deriv credentials
    ↓
OAuth provider redirects back with tokens in URL params:
  ?acct1=CR123456&token1=a1-xxx&cur1=USD&acct2=VR123&token2=a1-yyy&cur2=USD
    ↓
App extracts tokens from URL (AuthWrapper.tsx or callback-page.tsx)
    ↓
App calls authorize API with token
    ↓
WebSocket connection established
    ↓
User is logged in
```

### Key Files in the Auth Flow

1. **`src/components/shared/utils/config/config.ts`**
   - `generateOAuthURL()`: Creates login redirect URL
   - `getAppId()`: Returns app ID (from env or config)

2. **`src/external/bot-skeleton/services/api/appId.js`**
   - `generateDerivApiInstance()`: Creates WebSocket connection
   - Uses `VITE_APP_ID` from environment

3. **`src/app/AuthWrapper.tsx`**
   - Handles token extraction from URL
   - Calls authorize API
   - Manages auth errors

4. **`src/components/layout/header/header.tsx`**
   - Login button handler
   - Redirects to OAuth URL

5. **`src/pages/callback/callback-page.tsx`**
   - Alternative callback handler (if using `/callback` route)

## 🧪 Testing the Fix

### 1. Local Testing

```bash
# Set environment variable
echo "VITE_APP_ID=107518" > .env

# Run dev server
npm start

# Open browser to http://localhost:8443
# Click "Login"
# Should redirect to Deriv OAuth, then back with tokens
```

### 2. Production Testing Checklist

- [ ] Environment variable `VITE_APP_ID=107518` is set in Vercel
- [ ] Domain matches the registered redirect URL
- [ ] Click "Login" button
- [ ] Redirected to Deriv login page
- [ ] After login, redirected back to your app
- [ ] URL contains token parameters (briefly, then cleaned)
- [ ] User is logged in and sees their account info
- [ ] WebSocket connection is established
- [ ] Can place trades / use bot features

## 🐛 Troubleshooting

### Error: "Invalid OAuth redirect URL"
- **Cause**: Mismatch between registered redirect URL and actual deployment URL
- **Fix**: Use Option A or B above

### Error: "InvalidToken" or token exchange fails
- **Cause**: Token expired, or app ID mismatch
- **Fix**: Check `VITE_APP_ID` environment variable is set correctly

### Stuck on "Initializing..." or "Authorizing..."
- **Cause**: WebSocket connection failed, or authorize API call failed
- **Fix**: Check browser console for errors, verify app ID and server URL

### Login button doesn't redirect
- **Cause**: `generateOAuthURL()` returning incorrect URL
- **Fix**: Check brand.config.json and environment

### WebSocket connection fails
- **Cause**: Wrong server URL or app ID
- **Fix**: Check `getSocketURL()` and `VITE_APP_ID`

## 📝 Next Steps After Authentication Works

1. **Enable monitoring**: Add Datadog/Sentry keys
2. **Configure analytics**: Add Rudderstack key
3. **Set up custom domain**: Use a branded domain
4. **Enable HTTPS**: Vercel provides automatic SSL
5. **Add CI/CD**: GitHub Actions for automated testing
6. **Security**: Enable Dependabot, secret scanning

## 🔗 Useful Links

- [Deriv API Dashboard](https://api.deriv.com/dashboard) - Manage your app
- [Deriv API Docs - OAuth](https://developers.deriv.com/docs/oauth)
- [Deriv API Docs - Authentication](https://developers.deriv.com/docs/authentication)
- [Deriv API Explorer](https://api.deriv.com/api-explorer) - Test API calls
- [Your Vercel Project](https://vercel.com/dashboard)

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables in Vercel
3. Test locally first
4. Email Deriv API support: api-support@deriv.com
5. Join Deriv developer community: https://community.deriv.com/c/developers/48

---

**Last Updated**: October 25, 2025
