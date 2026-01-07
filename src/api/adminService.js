import AdminAPI from "./adminAPI.js";

// Create and configure admin API instance
const adminAPI = new AdminAPI();

// Set token from localStorage on initialization
const token = localStorage.getItem("token");
if (token) {
  adminAPI.setToken(token);
}

/**
 * Admin Service - High-level service layer for admin operations
 * This service layer provides a clean interface for React components
 * and handles token management automatically
 */
class AdminService {
  /**
   * Get completed tasks/applications for dashboard table
   */
  async getCompletedTasks(page = 1, limit = 20) {
    try {
      return await this.api.getCompletedTasks(page, limit);
    } catch (error) {
      console.error("Failed to fetch completed tasks:", error);
      throw error;
    }
  }
  constructor() {
    this.api = adminAPI;
  }

  // ========== AUTHENTICATION & TOKEN MANAGEMENT ==========

  /**
   * Initialize admin service with token
   */
  init() {
    const token = localStorage.getItem("token");
    if (token) {
      this.api.setToken(token);
    }
  }

  /**
   * Update token in API client
   */
  updateToken(token) {
    this.api.setToken(token);
  }

  /**
   * Clear token from API client
   */
  clearToken() {
    this.api.removeToken();
  }

  /**
   * Check admin access
   */
  async checkAccess() {
    try {
      return await this.api.checkAccess();
    } catch (error) {
      console.error("Admin access check failed:", error);
      // Don't throw here - let the caller handle it
      return null;
    }
  }

  // ========== DASHBOARD & STATISTICS ==========

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    try {
      return await this.api.getStats();
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get platform analytics
   */
  async getAnalytics(period = "30d") {
    try {
      return await this.api.getAnalytics(period);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      throw error;
    }
  }

  // ========== USER MANAGEMENT ==========

  /**
   * Get users with pagination and filters
   */
  async getUsers(page = 1, limit = 10, filters = {}) {
    try {
      const { search } = filters;
      const searchParam = search || "";

      const response = await this.api.getUsers(page, limit, searchParam);

      // Handle different response formats
      if (response?.users) {
        return {
          users: response.users,
          total: response.total || response.users.length,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || response.users.length) / limit),
          currentPage: response.currentPage || page,
        };
      }

      return {
        users: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
        currentPage: page,
      };
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(userId) {
    try {
      return await this.api.getUserDetails(userId);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      return await this.api.updateUser(userId, userData);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      return await this.api.deleteUser(userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  }

  // ========== TASK MANAGEMENT ==========

  /**
   * Get tasks with pagination and filters
   */
  async getTasks(page = 1, limit = 10, filters = {}) {
    try {
      const response = await this.api.getTasks(page, limit, filters);

      // Handle different response formats
      if (response?.tasks) {
        return {
          tasks: response.tasks,
          total: response.total || response.tasks.length,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || response.tasks.length) / limit),
          currentPage: response.currentPage || page,
        };
      }

      return {
        tasks: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
        currentPage: page,
      };
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  }

  /**
   * Get task details
   */
  async getTaskDetails(taskId) {
    try {
      return await this.api.getTaskDetails(taskId);
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      throw error;
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData) {
    try {
      return await this.api.createTask(taskData);
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, taskData) {
    try {
      return await this.api.updateTask(taskId, taskData);
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      return await this.api.deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }

  // ========== APPLICATION MANAGEMENT ==========

  /**
   * Get applications with pagination and filters
   */
  async getApplications(page = 1, limit = 10, filters = {}) {
    try {
      const response = await this.api.getApplications(page, limit, filters);

      // Handle different response formats
      if (response?.applications) {
        return {
          applications: response.applications,
          total: response.total || response.applications.length,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || response.applications.length) / limit),
          currentPage: response.currentPage || page,
        };
      }

      return {
        applications: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
        currentPage: page,
      };
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      throw error;
    }
  }

  /**
   * Get application details
   */
  async getApplicationDetails(applicationId) {
    try {
      return await this.api.getApplicationDetails(applicationId);
    } catch (error) {
      console.error("Failed to fetch application details:", error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status, feedback = "") {
    try {
      return await this.api.updateApplicationStatus(
        applicationId,
        status,
        feedback
      );
    } catch (error) {
      console.error("Failed to update application status:", error);
      throw error;
    }
  }

  /**
   * Bulk update applications
   */
  async bulkUpdateApplications(applicationIds, status, feedback = "") {
    try {
      return await this.api.bulkUpdateApplications(
        applicationIds,
        status,
        feedback
      );
    } catch (error) {
      console.error("Failed to bulk update applications:", error);
      throw error;
    }
  }

  // ========== ACTIVITY LOGS ==========

  /**
   * Get activity logs with pagination
   */
  async getActivityLogs(page = 1, limit = 20) {
    try {
      const response = await this.api.getActivityLogs(page, limit);

      // Handle different response formats
      if (response?.logs) {
        return {
          logs: response.logs,
          total: response.total || response.logs.length,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || response.logs.length) / limit),
          currentPage: response.currentPage || page,
        };
      }

      return {
        logs: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
        currentPage: page,
      };
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      throw error;
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(status, page = 1, limit = 10) {
    return await this.getApplications(page, limit, { status });
  }

  /**
   * Get pending applications
   */
  async getPendingApplications(page = 1, limit = 10) {
    return await this.getApplicationsByStatus("pending", page, limit);
  }

  /**
   * Get accepted applications
   */
  async getAcceptedApplications(page = 1, limit = 10) {
    return await this.getApplicationsByStatus("accepted", page, limit);
  }

  /**
   * Get rejected applications
   */
  async getRejectedApplications(page = 1, limit = 10) {
    return await this.getApplicationsByStatus("rejected", page, limit);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role, page = 1, limit = 10) {
    return await this.getUsers(page, limit, { role });
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status, page = 1, limit = 10) {
    return await this.getTasks(page, limit, { status });
  }

  /**
   * Get tasks by category
   */
  async getTasksByCategory(category, page = 1, limit = 10) {
    return await this.getTasks(page, limit, { category });
  }

  /**
   * Approve multiple applications
   */
  async approveApplications(applicationIds, feedback = "Application approved") {
    return await this.bulkUpdateApplications(
      applicationIds,
      "accepted",
      feedback
    );
  }

  /**
   * Reject multiple applications
   */
  async rejectApplications(applicationIds, feedback = "Application rejected") {
    return await this.bulkUpdateApplications(
      applicationIds,
      "rejected",
      feedback
    );
  }
}

// Create singleton instance
const adminService = new AdminService();

// Initialize on import
adminService.init();

// Export getTasks as a named export for frontend usage
export const getTasks = (...args) => adminService.getTasks(...args);
export { adminService };
export default adminService;
