// Clear localStorage Script
// Copy and paste this into your browser console to clear all stored data

console.log("🧹 CLEARING LOCALSTORAGE");
console.log("========================");

// Show current localStorage contents
console.log("Current localStorage contents:");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value);
}

// Clear all localStorage
localStorage.clear();

// Verify it's cleared
console.log("\nLocalStorage after clearing:");
console.log("Length:", localStorage.length);
console.log("Token:", localStorage.getItem("token"));
console.log("User:", localStorage.getItem("user"));

if (localStorage.length === 0) {
  console.log("✅ localStorage cleared successfully!");
  console.log("🔄 Please refresh the page and try logging in again.");
} else {
  console.log("❌ localStorage not fully cleared. Manual cleanup:");
  console.log("localStorage.removeItem('token');");
  console.log("localStorage.removeItem('user');");
}

// Optionally redirect to login
console.log("\n📍 Redirecting to login page...");
window.location.href = "/login";
