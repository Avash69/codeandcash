/**
 * Admin Access Helper
 *
 * This utility helps you set admin privileges for testing the admin panel.
 *
 * HOW TO USE:
 * 1. Login to your account
 * 2. Navigate to /admin-helper in your browser (add this to the URL)
 * 3. Click the "Make Me Admin" button
 * 4. Try accessing the admin panel again
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/authService";

const AdminHelper = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAdmin(currentUser?.role === "admin");
  }, []);

  const makeAdmin = () => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setMessage("No user found in localStorage. Please login first.");
        return;
      }

      // Parse user object
      const user = JSON.parse(userStr);

      // Set admin role
      user.role = "admin";

      // Save back to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      setMessage(
        "✅ Success! User updated with admin role. Try accessing the admin panel now."
      );
      setIsAdmin(true);
      setUser(user);
    } catch (error) {
      setMessage(`❌ Error updating user: ${error.message}`);
    }
  };

  const removeAdmin = () => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setMessage("No user found in localStorage. Please login first.");
        return;
      }

      // Parse user object
      const user = JSON.parse(userStr);

      // Remove admin role
      user.role = "user";

      // Save back to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("✅ Success! Admin role removed from user.");
      setIsAdmin(false);
      setUser(user);
    } catch (error) {
      setMessage(`❌ Error updating user: ${error.message}`);
    }
  };

  const checkStorage = () => {
    const userStr = localStorage.getItem("user");
    const tokenStr = localStorage.getItem("token");

    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("Raw user string:", userStr);
    console.log("Raw token string:", tokenStr);

    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        console.log("Parsed user object:", parsedUser);
        console.log("User role:", parsedUser.role);
        console.log("Role type:", typeof parsedUser.role);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    setMessage(
      `Current localStorage: 
      - User: ${userStr ? "Exists" : "Not found"} 
      - Token: ${tokenStr ? "Exists" : "Not found"}
      - User role: ${JSON.parse(userStr || "{}")?.role || "none"}

      Check browser console for detailed info.`
    );
  };

  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <div className="max-w-2xl p-8 mx-auto bg-gray-800 border border-gray-700 rounded-lg">
        <h1 className="mb-6 text-3xl font-bold text-indigo-400">
          Admin Access Helper
        </h1>

        <div className="p-4 mb-8 rounded-lg bg-gray-700/50">
          <h2 className="mb-2 text-xl font-bold">Current User Info</h2>
          {user ? (
            <div>
              <p>
                <span className="text-gray-400">Email:</span> {user.email}
              </p>
              <p>
                <span className="text-gray-400">Name:</span> {user.name}
              </p>
              <p>
                <span className="text-gray-400">Role:</span>{" "}
                <span
                  className={isAdmin ? "text-green-400" : "text-yellow-400"}
                >
                  {user.role || "none"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Admin Status:</span>{" "}
                {isAdmin ? (
                  <span className="text-green-400">✓ Is Admin</span>
                ) : (
                  <span className="text-red-400">✗ Not Admin</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-red-400">
              No user logged in. Please login first.
            </p>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <button
            onClick={makeAdmin}
            disabled={!user}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Make Me Admin
          </button>

          <button
            onClick={removeAdmin}
            disabled={!user}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Remove Admin Role
          </button>

          <button
            onClick={checkStorage}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Check LocalStorage
          </button>
        </div>

        {message && (
          <div className="p-4 mb-6 whitespace-pre-line rounded-lg bg-gray-700/50">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Link
            to="/login"
            className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Go to Login
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Go to Admin Panel
            </Link>
          )}

          <Link
            to="/"
            className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHelper;
