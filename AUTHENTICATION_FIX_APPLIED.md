# Authentication Fix Applied ✅

## Problem Identified

The issue was a **timing problem** in the authentication flow:

1. User logs in with Azure AD → Gets JWT token
2. Frontend calls `/api/auth/me` with Bearer token
3. **Backend's `CustomJwtGrantedAuthoritiesConverter` runs FIRST**
   - Tries to find user in database
   - User doesn't exist yet (first login)
   - Returns **empty authorities** (no roles)
4. Then `UserService.syncUser()` runs and creates/updates the user
5. But authorities were already set to empty, so request appears to fail
6. User sees pages briefly, then gets "Access Denied"

## Solution Applied

### 1. Modified Security Configuration (`SecurityConfig.java`)

**Changed:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/public/**").permitAll()
    .requestMatchers("/api/auth/me").authenticated()  // ✅ Allow JWT auth without role
    .anyRequest().authenticated()
)
```

**Why:** The `/api/auth/me` endpoint now only requires JWT authentication (not specific roles). This allows `UserService.syncUser()` to create/update the user first, then subsequent requests will have proper authorities.

### 2. Improved Azure ID Extraction

**Changed in both `SecurityConfig.java` and `UserService.java`:**
```java
// Extract Azure ID - try 'oid' first (Azure AD object ID), then 'sub'
String azureId = jwt.hasClaim("oid") ? jwt.getClaimAsString("oid") : jwt.getSubject();
```

**Why:** Azure AD tokens typically use the `oid` (object ID) claim as the unique identifier, not `sub`. This ensures consistent user identification.

### 3. Added Debug Logging

**Added in `CustomJwtGrantedAuthoritiesConverter`:**
```java
System.out.println("Assigned role " + role + " to user: " + email);
System.out.println("User not found in database (Azure ID: " + azureId + ", Email: " + email + "), will be synced via /api/auth/me");
```

**Why:** Helps track the authentication flow and identify issues.

## How It Works Now

### Correct Flow:

1. **User logs in** → Azure AD returns JWT token
2. **Frontend calls `/api/auth/me`** → With Bearer token
3. **`CustomJwtGrantedAuthoritiesConverter` runs:**
   - Tries to find user by Azure ID or email
   - If not found, returns empty authorities (OK for /api/auth/me)
   - Logs: "User not found in database, will be synced via /api/auth/me"
4. **Request reaches `/api/auth/me` endpoint** (allowed without roles)
5. **`UserService.syncUser()` runs:**
   - Extracts Azure ID and email from JWT
   - Finds existing user by email (pre-created by admin) OR
   - Creates new user if admin email OR
   - Throws exception if unauthorized
6. **Backend returns user data** → With correct role
7. **Frontend stores user in Redux** → User authenticated
8. **Subsequent requests:**
   - `CustomJwtGrantedAuthoritiesConverter` now finds user in database
   - Assigns correct role (ROLE_ADMIN or ROLE_USER)
   - Logs: "Assigned role ROLE_ADMIN to user: gopinath.s@posanagroups.com"
   - Requests proceed with proper authorization

## Testing Steps

### 1. Test Admin Login

1. Open browser: http://localhost:5173
2. Click "Sign in with Microsoft"
3. Login with: `gopinath.s@posanagroups.com`
4. **Expected:**
   - ✅ Dashboard loads successfully
   - ✅ No "Access Denied" message
   - ✅ Admin menu items visible
   - ✅ Backend logs show: "Assigned role ROLE_ADMIN to user: gopinath.s@posanagroups.com"

### 2. Check Backend Logs

After successful login, you should see:
```
User not found in database (Azure ID: xxx, Email: gopinath.s@posanagroups.com), will be synced via /api/auth/me
Assigned role ROLE_ADMIN to user: gopinath.s@posanagroups.com
```

### 3. Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. **Should NOT see:**
   - ❌ 401 Unauthorized errors
   - ❌ CORS errors
   - ❌ Token acquisition failures

4. **Should see:**
   - ✅ Successful API calls to /api/auth/me
   - ✅ User data with role: "ADMIN"

### 4. Check Network Tab

1. Open DevTools → Network tab
2. Filter: "XHR" or "Fetch"
3. Find `/api/auth/me` request
4. **Check Response:**
   ```json
   {
     "id": 1,
     "email": "gopinath.s@posanagroups.com",
     "name": "Gopinath S",
     "role": "ADMIN",
     "projectId": null,
     "projectName": null
   }
   ```

## If Still Having Issues

### Issue: Still see "Access Denied"

**Check:**
1. Clear browser cache and cookies
2. Logout completely from Microsoft account
3. Close all browser tabs
4. Restart both backend and frontend
5. Try again with fresh login

**Debug:**
```bash
# Check backend logs for:
grep -i "User not found" [log output]
grep -i "Assigned role" [log output]
```

### Issue: 401 Unauthorized

**Check:**
1. JWT token is being sent with requests
2. Token has correct issuer and audience
3. Backend logs show JWT validation errors

**Debug in browser console:**
```javascript
// Check if token is set
console.log(localStorage.getItem('msal.token'));

// Check API headers
// In Network tab → Headers → Request Headers
// Should show: Authorization: Bearer eyJ0eXAi...
```

### Issue: User created with wrong role

**Check database:**
```sql
-- In H2 Console (http://localhost:8080/h2-console)
SELECT * FROM users WHERE email = 'gopinath.s@posanagroups.com';
-- Should show role = 'ADMIN'
```

**Fix:**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'gopinath.s@posanagroups.com';
```

## Files Modified

1. **SecurityConfig.java**
   - Modified `.authorizeHttpRequests()` to allow `/api/auth/me` without role check
   - Improved `CustomJwtGrantedAuthoritiesConverter` to use `oid` claim
   - Added debug logging

2. **UserService.java**
   - Modified `syncUser()` to use `oid` claim for Azure ID extraction

## What Changed vs. Before

### Before:
- `/api/auth/me` required specific role
- Authorities converter couldn't find user (not created yet)
- Request failed with 403/401
- User saw "Access Denied"

### After:
- `/api/auth/me` only requires JWT authentication
- Authorities converter doesn't block if user not found
- UserService creates/syncs user first
- Subsequent requests have proper authorities
- User stays logged in

## Success Indicators

✅ Backend starts without errors
✅ Frontend loads at http://localhost:5173
✅ Login redirects to Microsoft
✅ After login, dashboard loads (no flash of "Access Denied")
✅ Backend logs show role assignment
✅ User can navigate between pages
✅ Admin menu items visible
✅ API requests succeed with 200 status

## Summary

The authentication flow has been fixed to ensure that:
1. Users can authenticate with just a valid JWT token
2. The `/api/auth/me` endpoint syncs/creates the user in the database
3. Subsequent requests use the database roles for authorization
4. No more "Access Denied" flashes after successful login

**Status: Ready to test! 🚀**

Try logging in now and it should work smoothly.
