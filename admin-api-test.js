// Admin API Test Script
// Run this in browser console or Node.js to test backend endpoints

const API_BASE = "http://localhost:5002"; // Change to your backend URL
const TOKEN = "your-admin-token-here"; // Replace with actual admin token

const testAdminAPI = async () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  console.log("=== ADMIN API TESTS ===");

  // Test 1: Check Admin Access
  try {
    const response = await fetch(`${API_BASE}/api/admin/check-access`, {
      headers,
    });
    if (response.status === 404) {
      console.log("✗ Admin Access: Endpoint not found (404)");
    } else {
      console.log("✓ Admin Access:", response.status, await response.json());
    }
  } catch (e) {
    console.log("✗ Admin Access Error:", e.message);
  }

  // Test 2: Get Dashboard Stats
  try {
    const response = await fetch(`${API_BASE}/api/admin/stats`, { headers });
    if (response.status === 404) {
      console.log("✗ Dashboard Stats: Endpoint not found (404)");
    } else {
      console.log("✓ Dashboard Stats:", response.status, await response.json());
    }
  } catch (e) {
    console.log("✗ Dashboard Stats Error:", e.message);
  }

  // Test 3: Get Users
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/users?page=1&limit=10`,
      { headers }
    );
    if (response.status === 404) {
      console.log("✗ Users: Endpoint not found (404)");
    } else {
      console.log("✓ Users:", response.status, await response.json());
    }
  } catch (e) {
    console.log("✗ Users Error:", e.message);
  }

  // Test 4: Get Tasks
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/tasks?page=1&limit=10`,
      { headers }
    );
    if (response.status === 404) {
      console.log("✗ Tasks: Endpoint not found (404)");
    } else {
      console.log("✓ Tasks:", response.status, await response.json());
    }
  } catch (e) {
    console.log("✗ Tasks Error:", e.message);
  }

  // Test 5: Get Task Applications
  try {
    const response = await fetch(`${API_BASE}/api/admin/task-applications`, {
      headers,
    });
    if (response.status === 404) {
      console.log("✗ Task Applications: Endpoint not found (404)");
    } else {
      console.log(
        "✓ Task Applications:",
        response.status,
        await response.json()
      );
    }
  } catch (e) {
    console.log("✗ Task Applications Error:", e.message);
  }
};

// Run the test
testAdminAPI();

/* 
USAGE:
1. Update TOKEN with your admin JWT token
2. Run in browser console: copy/paste this code
3. Or save as .js file and run with Node.js

EXPECTED ENDPOINTS:
- GET /api/admin/check-access
- GET /api/admin/stats (returns dashboard data)
- GET /api/admin/users?page=1&limit=10
- GET /api/admin/tasks?page=1&limit=10
- GET /api/admin/task-applications
- GET /api/admin/user-submissions/:userId (requires userId)
- GET /api/admin/submissions/:submissionId/download (file download)

BACKEND PORT: 5001
*/
