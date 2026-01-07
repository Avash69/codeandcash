/**
 * Admin Access Fix Utility
 * Run this in your browser console to fix admin access issues
 *
 * Usage:
 * 1. Open your browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to run
 */

function fixAdminAccess() {
  console.log("🔧 ADMIN ACCESS FIX UTILITY");
  console.log("==========================");

  // Check current state
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  console.log("Current token exists:", !!token);

  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
    console.log("Current user object:", user);
  } catch (e) {
    console.error("Error parsing user:", e);
  }

  // Fix missing or incorrect role
  if (user) {
    const oldRole = user.role;
    user.role = "admin";

    // Make sure admin email is consistent
    if (user.email === "admin@codeandcash.com" || !user.email) {
      user.email = "admin@codeandcash.com";
    }

    localStorage.setItem("user", JSON.stringify(user));
    console.log(`✅ User role updated: ${oldRole || "none"} → admin`);
  } else if (token) {
    // Create a basic admin user if we have a token but no user object
    console.log("Creating admin user object");
    const newUser = {
      _id: "admin-user",
      name: "Admin User",
      email: "admin@codeandcash.com",
      role: "admin",
    };
    localStorage.setItem("user", JSON.stringify(newUser));
    console.log("✅ Created admin user object");
  } else {
    console.log("❌ No token found. Creating emergency token and user.");
    // Create emergency token and user
    localStorage.setItem("token", "emergency-admin-token");
    const emergencyUser = {
      _id: "admin-emergency",
      name: "Emergency Admin",
      email: "admin@codeandcash.com",
      role: "admin",
    };
    localStorage.setItem("user", JSON.stringify(emergencyUser));
    console.log("✅ Created emergency admin token and user");
  }

  // Validate the fix
  try {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Updated user:", updatedUser);
    console.log("Updated role:", updatedUser?.role);

    if (updatedUser?.role === "admin") {
      console.log("✅ ADMIN ACCESS FIXED SUCCESSFULLY");
      console.log("Please refresh the page or navigate to /admin");
      return true;
    } else {
      console.log("❌ Fix failed. Please try manual method below:");
      console.log(`
localStorage.setItem("user", JSON.stringify({
  _id: "admin-user",
  name: "Admin User",
  email: "admin@codeandcash.com",
  role: "admin"
}));
localStorage.setItem("token", "emergency-admin-token");
window.location.reload();
      `);
      return false;
    }
  } catch (e) {
    console.error("Error validating fix:", e);
    return false;
  }
}

// Execute the function
const result = fixAdminAccess();
console.log("Script execution result:", result ? "SUCCESS" : "FAILED");
