/**
 * Enhanced Task API Service
 * Complete API service class for task-related operations with improved error handling
 * Based on the backend documentation endpoints
 */

class EnhancedTaskAPI {
  constructor() {
    // Use the same backend URL as authService for consistency
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5002"; // Match the backend port
    this.token = null;
    this.timeout = 15000; // 15 seconds timeout

    console.log("🔧 EnhancedTaskAPI initialized with baseURL:", this.baseURL);
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    console.log("🔑 Token set in API instance:", !!token);
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    this.token = null;
    console.log("🔑 Token removed from API instance");
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    console.log("🌐 Making request to:", url);
    console.log("🔑 Token present:", !!this.token);

    const requestOptions = {
      headers: this.getHeaders(),
      ...options,
    };

    // Add timeout to request
    const controller = new AbortController();
    requestOptions.signal = controller.signal;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        error.response = { data: errorData };
        throw error;
      }

      const data = await response.json();
      console.log("✅ API Response received:", !!data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      console.error("❌ API Request failed:", error.message);
      throw error;
    }
  }

  /**
   * Get user's applied tasks - Updated to use correct backend endpoint
   */
  async getMyAppliedTasks(params = {}) {
    const queryParams = new URLSearchParams();

    // Add supported query parameters according to backend docs
    if (params.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }
    if (params.page) {
      queryParams.append("page", params.page);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit);
    }
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    // Use the correct endpoint as documented: GET /api/applications/my
    const endpoint = `/api/applications/my${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("📋 Fetching applied tasks from:", endpoint);
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Get all available tasks
   */
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/api/tasks?${queryParams}` : "/api/tasks";
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Get featured tasks - Uses regular tasks endpoint with limit
   * Since backend doesn't have a dedicated /featured endpoint
   */
  async getFeaturedTasks(limit = 6) {
    const endpoint = `/api/tasks?limit=${limit}&page=1`;
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId) {
    const endpoint = `/api/tasks/${taskId}`;
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Apply for a task - Updated to match backend endpoint
   * @param {string} taskId - The ID of the task to apply for
   * @param {string} [message] - Optional message to include in the application
   */
  async applyForTask(taskId, message = "") {
    // Use the correct endpoint: POST /api/applications/apply/:taskId
    const endpoint = `/api/applications/apply/${taskId}`;
    return await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Submit files for an application - Updated to use correct endpoint
   */
  async submitFiles(applicationId, files) {
    const formData = new FormData();

    // Handle single file or array of files
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach((file) => {
      formData.append(`submissions`, file);
    });

    // Use the correct endpoint: POST /api/applications/:applicationId/submit
    const endpoint = `/api/applications/${applicationId}/submit`;
    return await this.request(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it for FormData
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
      },
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    const endpoint = "/api/profile";
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData) {
    const endpoint = "/api/profile";
    return await this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Search tasks
   */
  async searchTasks(query, params = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    }).toString();

    const endpoint = `/api/tasks/search?${queryParams}`;
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Get task categories
   */
  async getTaskCategories() {
    const endpoint = "/api/tasks/categories";
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Get application statistics
   */
  async getMyApplicationStats() {
    const endpoint = "/api/applications/my/stats";
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * Update application progress
   */
  async updateProgress(applicationId, progress) {
    const endpoint = `/api/applications/${applicationId}/progress`;
    return await this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify({ progress }),
    });
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(applicationId) {
    const endpoint = `/api/applications/${applicationId}/withdraw`;
    return await this.request(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * Delete submission file
   */
  async deleteSubmissionFile(applicationId, submissionId) {
    const endpoint = `/api/applications/${applicationId}/submissions/${submissionId}`;
    return await this.request(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * Get application details
   */
  async getApplicationById(applicationId) {
    const endpoint = `/api/applications/${applicationId}`;
    return await this.request(endpoint, { method: "GET" });
  }
}

// Export singleton instance
const enhancedTaskAPI = new EnhancedTaskAPI();
export default enhancedTaskAPI;
