/**
 * Admin Access Diagnostic Script
 * Run this in your browser console to debug admin access issues
 */

console.log("🔍 ADMIN ACCESS DIAGNOSTIC STARTING...\n");

// 1. Check localStorage data
console.log("1️⃣ CHECKING LOCALSTORAGE:");
const token = localStorage.getItem("token");
const userString = localStorage.getItem("user");

console.log("   Token exists:", !!token);
console.log("   Token value:", token ? token.substring(0, 20) + "..." : "none");
console.log("   User string:", userString);

let user = null;
try {
  user = userString ? JSON.parse(userString) : null;
  console.log("   Parsed user:", user);
  console.log("   User role:", user?.role);
  console.log("   User email:", user?.email);
} catch (error) {
  console.error("   ❌ Error parsing user:", error);
}

// 2. Check if user qualifies for admin
console.log("\n2️⃣ ADMIN QUALIFICATION CHECK:");
if (!user) {
  console.log("   ❌ No user found - need to login first");
} else if (!user.role) {
  console.log("   ❌ User has no role property");
} else if (user.role !== "admin") {
  console.log(`   ❌ User role is "${user.role}", needs to be "admin"`);
} else {
  console.log("   ✅ User has admin role!");
}

// 3. Test admin API endpoint
console.log("\n3️⃣ TESTING ADMIN API:");
if (token) {
  fetch("http://localhost:5002/api/admin/check-access", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("   API Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("   API Response data:", data);
    })
    .catch((error) => {
      console.log("   ❌ API Error:", error);
    });
} else {
  console.log("   ❌ No token available for API test");
}

// 4. Current URL check
console.log("\n4️⃣ CURRENT URL INFO:");
console.log("   Current pathname:", window.location.pathname);
console.log("   Should show admin link:", user?.role === "admin");

// 5. React Router check
console.log("\n5️⃣ NAVIGATION TEST:");
console.log("   Try clicking this link manually: /admin");
console.log("   Or run: window.location.href = '/admin'");

// 6. Quick fixes to try
console.log("\n🔧 QUICK FIXES TO TRY:");
console.log(
  "1. If you're not admin, make sure you login with admin@codeandcash.com"
);
console.log("2. If localStorage is empty, login again");
console.log("3. If role is wrong, check backend user creation/login");
console.log("4. If API fails, check if backend is running on port 5001");
console.log("5. Clear localStorage and login again: localStorage.clear()");

console.log("\n✅ DIAGNOSTIC COMPLETE");

export default function () {
  return "Admin diagnostic script loaded. Check console output above.";
}
