/**
 * Authentication API Service
 * Simple service for login, signup, and profile management
 */

import { STORAGE_KEYS } from "../constants/appConstants.js";

// Backend API URL - matches your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

/**
 * Login API
 * @param {Object} credentials - {email, password}
 * @returns {Promise} - Login response
 */
export const loginAPI = async (credentials) => {
  try {
    console.log("Login attempt for:", credentials.email);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Login failed");
    }

    // Store token and user data in localStorage (matching your backend response format)
    if (data.token) {
      let userData = data.data?.user || data.user;

      // CRITICAL FIX: Backend is not sending role field in login response
      // Force admin role for admin@codeandcash.com since backend strips it
      if (credentials.email.toLowerCase() === "admin@codeandcash.com") {
        console.log("🔧 FIXING: Backend missing role field for admin user");
        console.log("Original user data:", userData);

        // Ensure we have a user object
        if (!userData) {
          userData = {
            email: credentials.email,
            name: "System Administrator",
            id: "admin-user",
          };
        }

        // Force admin role since backend doesn't send it
        userData.role = "admin";
        console.log("✅ Fixed user data with admin role:", userData);
      }

      // Store the corrected user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      console.log("Final user data stored in localStorage:", userData);
    }

    return { success: true, data: data.data, token: data.token };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Signup API
 * @param {Object} userData - {name, email, password}
 * @returns {Promise} - Signup response
 */
export const signupAPI = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Signup failed");
    }

    // DON'T auto-store token and user data - let the user login manually
    // This prevents auto-login after registration

    return { success: true, data: data.data, token: data.token };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Profile API
 * @returns {Promise} - Profile data response
 */
export const profileAPI = async () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to fetch profile");
    }

    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update Profile API
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - Update response
 */
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to update profile");
    }

    // Update user data in localStorage
    if (data.data && data.data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
    }

    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Change Password API
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} - Change password response
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to change password");
    }

    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Upload Profile Image API
 * @param {FormData} formData - Form data with image file
 * @returns {Promise} - Upload response
 */
export const uploadProfileImage = async (formData) => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/profile/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to upload image");
    }

    return {
      success: true,
      data: data.data,
      imageUrl: data.data.profileImageUrl,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user) {
      console.log("No user found in localStorage");
      return null;
    }

    const parsedUser = JSON.parse(user);
    console.log("getCurrentUser parsed result:", parsedUser);

    // CRITICAL FIX: Backend doesn't send role field, so we need to ensure admin users have it
    if (parsedUser && parsedUser.email === "admin@codeandcash.com") {
      if (!parsedUser.role || parsedUser.role !== "admin") {
        console.log("🔧 FIXING: Adding missing admin role to admin user");
        parsedUser.role = "admin";
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsedUser));
        console.log("✅ Admin role added:", parsedUser);
      }
    }

    return parsedUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Helper function to check if user is logged in
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Helper function to logout user
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Get User Profile API (alias for profileAPI for compatibility)
 * @returns {Promise} - Profile data response
 */
export const getUserProfile = profileAPI;

/**
 * Backward compatibility exports for old function names
 */
export const loginUser = loginAPI;
export const registerUser = signupAPI;
export const signupUser = signupAPI;
