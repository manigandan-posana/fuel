# 🔍 Authentication Debugging Guide

## Current Status
✅ Backend: Running on port 8080 with enhanced logging
✅ Frontend: Running on port 5173 with error details
✅ Admin user seeded: gopinath.s@posanagroups.com

## 🚨 What to Check Now

### Step 1: Open Browser Developer Tools

1. Open **http://localhost:5173** in your browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### Step 2: Attempt Login

1. Click "Sign in with Microsoft"
2. Login with **gopinath.s@posanagroups.com**
3. Watch the console output

### Step 3: What You Should See

#### ✅ If Login is Successful:

**Console output:**
```
Calling /auth/me with token: eyJ0eXAiOiJKV1QiLCJ...
User sync successful: {id: 1, email: "gopinath.s@posanagroups.com", role: "ADMIN", ...}
```

**Backend logs (in terminal):**
```
🔍 Syncing user with Azure ID: [some-guid]
📧 Extracted from JWT - Email: gopinath.s@posanagroups.com, Name: Gopinath S
✅ Updated pre-created user: gopinath.s@posanagroups.com with Azure ID: [guid]
Assigned role ROLE_ADMIN to user: gopinath.s@posanagroups.com
```

**Result:** Dashboard loads successfully

---

#### ❌ If Login Fails:

**You'll see detailed error in the browser:**
- Access Denied screen will show error details
- Console will show exactly what went wrong

**Check Backend Logs for:**
1. What Azure ID was extracted
2. What email was extracted
3. Why the user wasn't found/created

---

## 🔧 Common Issues and Solutions

### Issue 1: JWT Token Claims Missing

**Symptoms:**
- Backend logs show: `Email: unknown@domain.com`
- Or: `Azure ID: null`

**Solution:**
The JWT token from Azure AD might not have the expected claims. 

**Check in console:** Look for the error details showing which claims are missing.

**Fix:** We need to adjust the claim extraction in `UserService.java` to match your Azure AD configuration.

---

### Issue 2: Azure ID Mismatch

**Symptoms:**
- Backend logs show: `🔍 Syncing user with Azure ID: [guid-1]`
- But database has: `azure_id: admin-[timestamp]` (the seeded placeholder)

**What's happening:**
The seeded admin user has a placeholder Azure ID that doesn't match your real Microsoft account's Azure ID.

**Solution:**
The `updateUserOnFirstLogin()` method should update the Azure ID, but let's verify it's working.

**Backend logs should show:**
```
✅ Updated pre-created user: gopinath.s@posanagroups.com with Azure ID: [real-guid]
```

If you don't see this, the email matching might be failing.

---

### Issue 3: Email Case Sensitivity

**Symptoms:**
- Backend logs show different email case
- Example: JWT has "Gopinath.S@posanagroups.com" but database has "gopinath.s@posanagroups.com"

**Solution:**
Already handled with `.equalsIgnoreCase()` but verify the email extraction is working.

---

### Issue 4: CORS Error

**Symptoms:**
- Console shows: `Access to fetch at 'http://localhost:8080/api/auth/me' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Backend logs show:**
- No logs at all (request didn't reach backend)

**Solution:**
CORS is already configured, but if you see this, check:
1. Backend is running on port 8080
2. Frontend is running on port 5173
3. No firewall blocking localhost

---

### Issue 5: JWT Validation Failure

**Symptoms:**
- Console shows: `401 Unauthorized`
- Error message about JWT validation

**Backend logs show:**
```
❌ Unhandled Exception: ...InvalidJwtException...
```

**Possible causes:**
1. Azure Tenant ID or Client ID is incorrect in `application.properties`
2. Token audience doesn't match
3. Token issuer doesn't match

**To verify:**
Check if the JWT issuer in the token matches the configuration:
- Expected: `https://login.microsoftonline.com/7ba6b92d-20e2-4e35-8a6d-1ad937682d1b/v2.0`

---

## 🎯 Most Likely Issue

Based on the symptom "Access Denied immediately after login", the most likely cause is:

**Azure ID mismatch between seeded user and actual Azure account**

### Why This Happens:
1. Admin user is seeded with `azure_id: "admin-[timestamp]"` (placeholder)
2. You log in with Microsoft account
3. JWT has your real Azure ID (e.g., "abc123-real-guid-xyz")
4. Backend looks for user with Azure ID "abc123-real-guid-xyz" → Not found
5. Backend tries to find by email "gopinath.s@posanagroups.com" → Found!
6. `updateUserOnFirstLogin()` should update the Azure ID
7. If it doesn't update correctly, subsequent checks fail

### What the Logs Will Tell Us:

Watch for this sequence in **backend logs**:
```
🔍 Syncing user with Azure ID: abc123-real-guid-xyz
📧 Extracted from JWT - Email: gopinath.s@posanagroups.com, Name: Gopinath S
✅ Updated pre-created user: gopinath.s@posanagroups.com with Azure ID: abc123-real-guid-xyz
```

If you see `❌ Access denied for user:` instead, then the email matching failed.

---

## 📋 Step-by-Step Debugging Process

1. **Clear browser cache and cookies**
   - Go to Settings → Privacy → Clear browsing data
   - Or use Incognito/Private mode

2. **Start fresh**
   - Close all browser tabs
   - Restart backend (to reset database)
   - Restart frontend

3. **Login and watch logs**
   - Open Console (F12)
   - Open backend terminal logs
   - Click "Sign in with Microsoft"
   - Watch BOTH console and backend logs simultaneously

4. **Copy the error details**
   - If "Access Denied" appears, copy the error details shown on screen
   - Copy all console errors
   - Copy backend log lines starting with 🔍, 📧, ✅, or ❌

5. **Share the logs**
   - Paste them here so we can diagnose the exact issue

---

## 🔑 Quick Database Check

If you want to verify the database state:

1. Open: http://localhost:8080/h2-console
2. JDBC URL: `jdbc:h2:mem:fueldb`
3. Username: `sa`
4. Password: (leave empty)
5. Click "Connect"

Run this query:
```sql
SELECT id, email, azure_id, role FROM users;
```

**Expected result:**
```
ID | EMAIL                           | AZURE_ID           | ROLE
1  | gopinath.s@posanagroups.com    | admin-[timestamp]  | ADMIN
```

After first login, the `azure_id` should change to your real Azure ID.

---

## 📞 Next Steps

1. **Try logging in now**
2. **Check the console and backend logs**
3. **Look for the emoji icons (🔍 📧 ✅ ❌) in backend logs**
4. **Share any errors you see**

The enhanced logging will tell us exactly where the authentication is failing!
