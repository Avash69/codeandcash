# Admin Access Troubleshooting Guide

## Issue: Admin cannot access admin dashboard

**🔍 IDENTIFIED ISSUE:** The backend is not sending the `role` field in the login response, even though the admin user has `role: "admin"` in the database.

**✅ FIXED:** The frontend now automatically adds the admin role for admin@codeandcash.com users during login and when retrieving user data.

### 📋 Diagnostic Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Run this diagnostic script** in the console:

```javascript
// Copy and paste this entire block into your browser console:

console.log("🔍 ADMIN ACCESS DIAGNOSTIC");
console.log("========================");

// Check localStorage
const token = localStorage.getItem("token");
const userString = localStorage.getItem("user");
let user = null;

try {
  user = userString ? JSON.parse(userString) : null;
} catch (e) {
  console.error("❌ Error parsing user:", e);
}

console.log("1. Token exists:", !!token);
console.log("2. User object:", user);
console.log("3. User role:", user?.role);
console.log("4. User email:", user?.email);

// Check if admin link should show
console.log("5. Should show admin link:", user?.role === "admin");

// Check current URL
console.log("6. Current URL:", window.location.pathname);

// Conclusion
if (!token) {
  console.log("🔧 SOLUTION: You need to login first");
} else if (!user) {
  console.log("🔧 SOLUTION: User data is corrupted, try logging in again");
} else if (user.role !== "admin") {
  console.log("🔧 SOLUTION: You need to login with an admin account");
  console.log("   Try: admin@codeandcash.com");
} else {
  console.log("✅ Everything looks good! Admin access should work.");
}
```

### 🛠️ Common Solutions

#### 1. **Not Logged In**

- **Problem:** No token in localStorage
- **Solution:** Go to login page and sign in

#### 2. **Wrong Account**

- **Problem:** User role is not "admin"
- **Solution:** Login with admin account (admin@codeandcash.com)
- **Quick Fix:** Use our improved admin fix utility:

```javascript
// Copy and paste this entire block:
fetch("/public/makeAdmin.js")
  .then((response) => response.text())
  .then((script) => {
    eval(script);
  })
  .catch((err) => {
    console.error("Couldn't load fix script:", err);

    // Fallback direct fix
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.role = "admin";
    localStorage.setItem("user", JSON.stringify(user));
    console.log("Applied manual admin role fix:", user);
  });
```

#### 3. **Corrupted Data**

- **Problem:** localStorage data is invalid
- **Solution:** Clear storage and login again

```javascript
// CLEAR LOCALSTORAGE - Copy and paste this into browser console
console.log("🧹 Clearing localStorage...");
localStorage.clear();
console.log("✅ localStorage cleared!");
window.location.href = "/login";
```

**Alternative manual clear:**

```javascript
localStorage.removeItem("token");
localStorage.removeItem("user");
window.location.reload();
```

#### 4. **Admin Link Not Showing**

- **Problem:** Header doesn't show admin link
- **Solution:** Check user role in console, refresh page after login

#### 5. **Can't Navigate to /admin**

- **Problem:** URL changes but page doesn't load
- **Solution:** Check console for errors, verify React Router setup

### 🧪 Quick Tests

#### Test 1: Direct Navigation

```javascript
window.location.href = "/admin";
```

#### Test 2: Force Admin Role (Temporary)

```javascript
const user = JSON.parse(localStorage.getItem("user"));
user.role = "admin";
localStorage.setItem("user", JSON.stringify(user));
window.location.reload();
```

#### Test 3: Check API Endpoint

```javascript
fetch("http://localhost:5002/api/admin/check-access", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => console.log("API Response:", data))
  .catch((err) => console.log("API Error:", err));
```

### 📝 Expected Behavior

1. **Login with admin account** → User object has role: "admin"
2. **Admin link appears** in header navigation
3. **Click admin link** → Navigate to /admin
4. **Admin dashboard loads** with sidebar and stats

### 🚨 Emergency Admin Access

If you can't get admin access working, try this improved emergency override:

```javascript
// EMERGENCY ADMIN ACCESS (improved fix)
// Copy and paste this entire block into your browser console:

// Create admin user with proper structure
const adminUser = {
  _id: "admin123",
  name: "Admin User",
  email: "admin@codeandcash.com",
  role: "admin",
};

// Store in localStorage with proper formatting
localStorage.setItem("user", JSON.stringify(adminUser));
localStorage.setItem("token", "emergency-admin-token");

// Verify the fix worked
const storedUser = JSON.parse(localStorage.getItem("user"));
console.log("Admin user created:", storedUser);
console.log("Admin role set:", storedUser.role === "admin");

// Navigate to admin dashboard
window.location.href = "/admin";
```

### 📱 Admin Access Test Page

For more comprehensive diagnostics and fixes, open our test page:

- Go to: [/admin-api-test.html](/admin-api-test.html)
- This page provides interactive tools to:
  - Check your current user status
  - Fix admin access issues
  - Test backend API endpoints
  - Create emergency admin access
  - Navigate to the admin dashboard

### 📞 Still Having Issues?

Check these files for more details:

- Browser Console (F12) for error messages
- Network tab for failed API calls
- `src/layouts/AdminLayout.jsx` - Admin access logic
- `src/components/common/Header.jsx` - Admin link logic
- `src/api/authService.jsx` - Login and user management

### ✅ Verification Checklist

- [ ] User is logged in (token exists)
- [ ] User has admin role
- [ ] Admin link shows in header
- [ ] /admin URL loads admin dashboard
- [ ] No console errors
- [ ] Backend API is running (port 5001)

---

**Most Common Fix:** Login with `admin@codeandcash.com` and the correct password.
