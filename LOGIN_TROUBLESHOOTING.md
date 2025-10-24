# Login Troubleshooting Guide

## Common Login Errors and Solutions

### Error: "Cannot connect to server"

**Symptoms:**
- Login button shows "Logging in..." indefinitely
- Console shows network error or timeout
- Request URL shows in network tab but fails

**Solutions:**
1. **Check if NEXT_PUBLIC_BASE_DOMAIN is set:**
   - Create `.env.local` in the `scriptiflow` directory
   - Add: `NEXT_PUBLIC_BASE_DOMAIN=https://scriptiflow-server.onrender.com`
   - Restart the development server: `npm run dev`

2. **Verify the backend URL is accessible:**
   - Try opening `https://scriptiflow-server.onrender.com/api/health` in your browser
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check CORS settings:**
   - Ensure your frontend domain is allowed in server CORS configuration
   - The server now allows: `https://app.scriptiflow.com` and `https://scriptiflow.com`

### Error: "Invalid login credentials" or "401 Unauthorized"

**Symptoms:**
- Error message: "Invalid login credentials"
- HTTP status: 401

**Solutions:**
1. **Verify Supabase credentials on the server:**
   - Check `.env` file in `scriptiflow_server`
   - Ensure `SUPABASE_URL`, `SUPABASE_ANON_KEY` are correct
   - Run: `node test-login-setup.js` to verify

2. **Check if user exists:**
   - Log into Supabase dashboard
   - Go to Authentication → Users
   - Verify the email/password combination

3. **Reset password if needed:**
   - Use the "Forgot password?" link on login page
   - Or create a new user through Supabase dashboard

### Error: "Failed to fetch" or CORS Error

**Symptoms:**
- Console error: "Access to XMLHttpRequest has been blocked by CORS policy"
- Network tab shows request was cancelled

**Solutions:**
1. **Update server CORS configuration:**
   - Already fixed in the latest code
   - Ensure server is restarted after changes

2. **Check browser console for specific CORS error:**
   - Missing `Access-Control-Allow-Origin` header
   - Missing `Access-Control-Allow-Credentials` header

3. **Verify frontend is using correct protocol:**
   - Use HTTPS in production
   - Match the protocol in NEXT_PUBLIC_BASE_DOMAIN

### Error: "Internal server error" or "500"

**Symptoms:**
- HTTP status: 500
- Generic error message

**Solutions:**
1. **Check server logs:**
   - On Render.com: Go to your service → Logs
   - Look for error messages related to Supabase or database

2. **Verify Supabase configuration:**
   - Run test script: `cd scriptiflow_server && node test-login-setup.js`
   - Check if Supabase tables exist (especially `users_app`)

3. **Check environment variables:**
   - Ensure all required variables are set on Render.com
   - Variables are case-sensitive

### Error: No error shown, just redirects back to login

**Symptoms:**
- Login appears successful
- Redirects to dashboard then back to login
- No error message displayed

**Solutions:**
1. **Check browser localStorage:**
   - Open DevTools → Application → Local Storage
   - Verify `access_token`, `refresh_token`, `user` are being set
   - Clear localStorage and try again

2. **Check token expiration:**
   - Token might be expired immediately
   - Verify system clock is correct
   - Check Supabase JWT settings

3. **Check session validation:**
   - Ensure the user object includes the `role` field
   - Verify `users_app` table has correct data

## Testing the Setup

### 1. Test Backend Connection
```bash
# From command line
curl https://scriptiflow-server.onrender.com/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Run Setup Verification Script
```bash
cd scriptiflow_server
node test-login-setup.js
```

### 3. Test Login Endpoint Directly
```bash
curl -X POST https://scriptiflow-server.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

## Step-by-Step Checklist

- [ ] Frontend `.env.local` file exists with `NEXT_PUBLIC_BASE_DOMAIN`
- [ ] Backend `.env` file exists with Supabase credentials
- [ ] Backend server is running (check `/api/health` endpoint)
- [ ] Supabase project is accessible
- [ ] Test user exists in Supabase Authentication
- [ ] CORS is configured correctly for your domain
- [ ] Browser has no SSL/certificate errors
- [ ] No browser extensions blocking requests (try incognito mode)

## Getting More Information

To get detailed error information:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to log in
4. Click on the failed `/api/login` request
5. Check the Response tab for error details
6. Check the Console tab for JavaScript errors

## Contact Support

If none of these solutions work, please provide:
- Complete error message from console
- Network tab screenshot showing the failed request
- Response body from the failed request
- Browser and OS information





