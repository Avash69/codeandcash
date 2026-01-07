/**
 * Base API service configuration
 * Frontend API client for communicating with backend services
 */

import { STORAGE_KEYS } from "../constants/appConstants.js";

// Base URL for API calls - configure this to point to your backend
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

/**
 * HTTP client configuration
 */
class ApiClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Generic HTTP request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    // Handle FormData uploads
    if (options.body instanceof FormData) {
      // Remove Content-Type header to let browser set it for FormData
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Try to extract error message from response body
        const errorMessage =
          data.message ||
          data.error ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  /**
   * HTTP GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  /**
   * HTTP POST request
   */
  async post(endpoint, data, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: "POST",
      body,
      ...options,
    });
  }

  /**
   * HTTP PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * HTTP PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * HTTP DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    // Store token in localStorage for persistence
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

/**
 * API wrapper function for consistent error handling
 */
export const apiWrapper = async (apiCall) => {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
