# Access Control Implementation - Admin & User Separation

## Overview
This implementation enforces strict role-based access control where:
- **Only admin-created users** with Microsoft authentication can access the system
- **Admin** has full access to all management features
- **Users** can only manage vehicles and fuel entries (no project/user management)

---

## Backend Changes

### 1. User Creation Restriction (`UserService.java`)

#### Modified `syncUser()` Method
- **Before:** Any Microsoft-authenticated user was automatically created as USER
- **After:** 
  - Only `gopinath.s@posanagroups.com` or first user can auto-register as ADMIN
  - Pre-created users (by admin) can login and update their Azure ID
  - All other users get `SecurityException: "Access denied. Please contact your administrator..."`

```java
// Check if user was pre-created by admin
User preCreatedUser = updateUserOnFirstLogin(email, azureId, name);
if (preCreatedUser != null) {
    return preCreatedUser;
}

// Only admin email or first user can auto-register
if ("gopinath.s@posanagroups.com".equalsIgnoreCase(email) || userRepository.count() == 0) {
    // Create admin
}

// All others must be created by admin first
throw new SecurityException("Access denied...");
```

#### New Methods Added

**`createUser(String email, String name, Long projectId)`**
- Admin creates user with pending Azure ID (`pending-{email}`)
- User gets USER role automatically
- Can optionally assign project during creation
- Returns error if user already exists

**`updateUserOnFirstLogin(String email, String azureId, String name)`**
- Updates pending user's Azure ID on first login
- Links Microsoft account to pre-created user
- Returns null if user doesn't exist (triggers access denied)

### 2. New Endpoint (`AuthController.java`)

**`POST /api/auth/users`** - Create New User (Admin Only)
```json
Request Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "projectId": 1  // Optional
}
```
- Requires `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`
- Creates user who can then login with Microsoft account

### 3. Project Management Restriction (`ProjectController.java`)

**`GET /api/projects`** - Added `@PreAuthorize("ROLE_ADMIN")`
- **Before:** Any authenticated user could list projects
- **After:** Only admin can view projects list
- Users don't need to see projects (auto-assigned)

### 4. Existing Security
All existing endpoints already have proper guards:
- ✅ `POST /api/projects` - Admin only
- ✅ `GET /api/auth/users` - Admin only
- ✅ `POST /api/auth/users/{id}/assign-project/{projectId}` - Admin only
- ✅ Vehicle/Fuel operations - Role-based filtering built-in

---

## Frontend Changes

### 1. Navigation Updates

#### Layout.tsx
Already properly configured to show/hide menu items based on role:
```tsx
const menuItems = [
    { path: '/', icon: 'pi-home', label: 'Dashboard' },
    { path: '/vehicles', icon: 'pi-car', label: 'Vehicles' },
    { path: '/fuel', icon: 'pi-chart-line', label: 'Fuel Entries' },
    { path: '/today', icon: 'pi-calendar', label: "Today's Entries" },
    ...(user?.role === 'ADMIN' ? [
        { path: '/projects', icon: 'pi-building', label: 'Projects' },
        { path: '/users', icon: 'pi-users', label: 'User Management' }
    ] : [])
];
```

**Result:**
- **Users** see: Dashboard, Vehicles, Fuel Entries, Today's Entries
- **Admin** sees: All above + Projects + User Management

#### App.tsx - Route Protection
```tsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/vehicles" element={<Vehicles />} />
  <Route path="/fuel" element={<Fuel />} />
  <Route path="/today" element={<TodayEntries />} />
  {user?.role === 'ADMIN' && (
    <>
      <Route path="/projects" element={<Projects />} />
      <Route path="/users" element={<UserManagement />} />
    </>
  )}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### 2. Access Denied Screen (`App.tsx`)

Added error handling for unauthorized users:
```tsx
if (status === 'failed') {
  return (
    <div>
      <h1>Access Denied</h1>
      <p>Your account is not authorized to access this system.</p>
      <p>Please contact your administrator to request access.</p>
      <Button label="Logout" onClick={logout} />
    </div>
  );
}
```

**Trigger:** User tries to login but not in database (not created by admin)

### 3. User Management Page (`UserManagement.tsx`)

#### New Feature: Create User
Added "Create User" button and dialog:

**Fields:**
- Email (Microsoft Account) - Required
- Full Name - Required
- Assign to Project - Optional

**Functionality:**
```tsx
const handleCreateUser = async () => {
  await api.post('/auth/users', newUser);
  toast.success('User created successfully. They can now login with their Microsoft account.');
};
```

**UI Changes:**
- Header now has "Create User" button (green)
- Dialog validates email and name required
- Shows helpful message about Microsoft account requirement
- Can assign project during user creation

---

## User Flow Scenarios

### Scenario 1: Admin First-Time Setup
1. Admin (`gopinath.s@posanagroups.com`) logs in with Microsoft
2. System creates admin automatically (first user exception)
3. Admin sees all menu items (Dashboard, Vehicles, Fuel, Today's, Projects, Users)
4. Admin creates projects
5. Admin creates users and assigns them to projects

### Scenario 2: Regular User Creation & Login
1. **Admin Action:**
   - Admin goes to User Management
   - Clicks "Create User"
   - Enters: `john.doe@example.com`, "John Doe", Project ID
   - User created with status "pending Azure authentication"

2. **User Action:**
   - John Doe visits application
   - Clicks "Login with Microsoft"
   - Authenticates with `john.doe@example.com`
   - System finds pre-created user, updates Azure ID
   - John is logged in successfully
   - John sees: Dashboard, Vehicles, Fuel, Today's Entries
   - John can only manage data for assigned project

### Scenario 3: Unauthorized User Attempt
1. Random user tries to login with `random@example.com`
2. Microsoft authentication succeeds
3. Backend checks: user not in database
4. Backend throws `SecurityException`
5. Frontend shows "Access Denied" screen
6. User must contact admin to be added

---

## Security Summary

### Backend Security Layers
1. **Spring Security** - JWT token validation
2. **Method Security** - `@PreAuthorize` annotations
3. **Service Layer** - Role-based data filtering
4. **User Creation** - Admin-only via explicit endpoint
5. **Auto-Registration** - Blocked except for admin email

### Frontend Security Layers
1. **Route Guards** - Admin-only routes conditional
2. **Navigation** - Menu items filtered by role
3. **Access Denied** - Graceful handling of unauthorized users
4. **API Calls** - Token required for all requests

---

## API Endpoints Summary

### Public (Authenticated)
- `GET /api/auth/me` - Get current user info

### Admin Only
- `GET /api/auth/users` - List all users
- `POST /api/auth/users` - Create new user ⭐ NEW
- `POST /api/auth/users/{id}/assign-project/{projectId}` - Assign project
- `GET /api/projects` - List projects (NOW RESTRICTED)
- `POST /api/projects` - Create project

### Role-Based (Filtered)
- `GET /api/vehicles` - Admin sees all, User sees project's only
- `POST /api/vehicles` - Admin specifies project, User uses assigned
- `DELETE /api/vehicles/{id}` - Permission-checked
- `GET /api/fuel` - Admin sees all, User sees project's only
- `POST /api/fuel` - Admin specifies vehicle, User limited to project
- `DELETE /api/fuel/{id}` - Permission-checked

---

## Testing Checklist

### Backend Tests
- [ ] Admin can create user via POST /api/auth/users
- [ ] Non-admin cannot access POST /api/auth/users (403)
- [ ] Non-admin cannot access GET /api/projects (403)
- [ ] Pre-created user can login successfully
- [ ] Non-pre-created user gets 403 access denied
- [ ] Admin email auto-creates as ADMIN
- [ ] First user becomes ADMIN

### Frontend Tests
- [ ] Admin sees all menu items
- [ ] User sees only allowed menu items (no Projects/Users)
- [ ] User cannot navigate to /projects or /users (redirected)
- [ ] Admin can create users in User Management
- [ ] Created user can login with Microsoft account
- [ ] Unauthorized user sees "Access Denied" screen
- [ ] Access Denied screen has working logout button

### Integration Tests
1. **Fresh System:**
   - Login as `gopinath.s@posanagroups.com`
   - Verify ADMIN role assigned
   - Create project
   - Create user with project assignment
   - Logout

2. **Pre-created User:**
   - Login as newly created user
   - Verify USER role
   - Verify project assigned
   - Check vehicles filtered to project only
   - Verify cannot access Projects/Users pages

3. **Unauthorized User:**
   - Try login with non-created email
   - Verify "Access Denied" message
   - Verify logout works

---

## Migration Notes

### Database
No schema changes required. Users table already supports:
- `azure_id` - Updated on first login
- `email` - Used for pre-creation
- `role` - ADMIN/USER
- `project_id` - Assigned by admin

### Environment Variables
No changes to `.env` files required.

### Breaking Changes
⚠️ **Important:** After deployment, existing non-admin users will be **BLOCKED** on next login unless:
1. Admin pre-creates their account, OR
2. They were already in the database

**Mitigation:**
Run this script to preserve existing users:
```sql
-- All existing users keep their access
-- No action needed if users already in database
SELECT email, name, role FROM users WHERE role = 'USER';
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** User gets "Access Denied" after admin created them
**Solution:** 
- Verify email exactly matches Microsoft account
- Check user exists: `GET /api/auth/users`
- Verify `azure_id` starts with "pending-"

**Issue:** Admin cannot create user (403 Forbidden)
**Solution:**
- Verify admin role in database
- Check JWT token contains "ROLE_ADMIN"
- Restart backend after role changes

**Issue:** User sees admin menu items
**Solution:**
- Clear browser cache
- Verify `/api/auth/me` returns correct role
- Check Redux state in dev tools

---

## Configuration

### Admin Email
To change default admin email, update `UserService.java`:
```java
if ("your.admin@example.com".equalsIgnoreCase(email) || userRepository.count() == 0) {
    newUser.setRole(UserRole.ADMIN);
}
```

Also update `DataInitializer.java`:
```java
String adminEmail = "your.admin@example.com";
```

---

**Status:** ✅ Fully Implemented  
**Build Status:** ✅ Backend compiles successfully  
**Security Model:** Admin-creates-users with Microsoft authentication  
**Access Control:** Role-based with strict separation
