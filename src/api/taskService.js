/**
 * Task API service
 * Frontend service for task-related API calls
 */

import enhancedTaskAPI from "./enhancedTaskAPI";

/**
 * Get all tasks with optional filters
 * Always uses response.data.tasks as the source of truth per backend contract
 */
export const getTasks = async (filters = {}) => {
  const token = localStorage.getItem("token");
  if (token) {
    enhancedTaskAPI.setToken(token);
  }

  try {
    const response = await enhancedTaskAPI.getTasks(filters);
    console.log("🔍 Raw API response:", response);

    // Handle different response formats from backend
    if (response?.data && Array.isArray(response.data)) {
      console.log(
        "✅ Tasks loaded from response.data:",
        response.data.length,
        "tasks"
      );
      return response.data;
    } else if (response?.data?.tasks && Array.isArray(response.data.tasks)) {
      console.log(
        "✅ Tasks loaded from response.data.tasks:",
        response.data.tasks.length,
        "tasks"
      );
      return response.data.tasks;
    } else if (Array.isArray(response)) {
      console.log(
        "✅ Tasks loaded from response array:",
        response.length,
        "tasks"
      );
      return response;
    }

    // If the expected format is not found, log the issue and return empty array
    console.warn("⚠️ Backend response format unexpected:", response);
    return [];
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return [];
  }
};

/**
 * Get single task by ID
 * Validates MongoDB ObjectId format and handles backend response structure
 */
export const getTaskById = async (taskId) => {
  // Validate task ID format (24 hexadecimal characters for MongoDB ObjectId)
  if (!taskId || !/^[0-9a-fA-F]{24}$/.test(taskId)) {
    const error = new Error("Invalid task ID format");
    error.status = 400;
    throw error;
  }

  const token = localStorage.getItem("token");
  if (token) {
    enhancedTaskAPI.setToken(token);
  }

  try {
    console.log("🔍 Fetching task with ID:", taskId);
    const response = await enhancedTaskAPI.getTaskById(taskId);

    // Handle response according to backend guide: { task: {...} }
    if (response && response.task) {
      console.log("✅ Task fetched successfully from response.task");
      return response.task;
    } else if (response && response._id) {
      console.log("✅ Task fetched successfully as direct response");
      return response;
    } else {
      console.error("❌ Unexpected response format in getTaskById:", response);
      const error = new Error("Invalid response format from server");
      error.status = 500;
      throw error;
    }
  } catch (error) {
    console.error("❌ Error in getTaskById:", error);

    // Re-throw with enhanced error information
    if (error.status) {
      throw error;
    } else {
      const enhancedError = new Error("Failed to fetch task details");
      enhancedError.status = 500;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }
};

/**
 * Create new task
 */
export const createTask = async (_taskData) => {
  // This would need admin endpoint - using enhancedTaskAPI for consistency
  throw new Error("Task creation requires admin privileges");
};

/**
 * Update task
 */
export const updateTask = async (_taskId, _taskData) => {
  // This would need admin endpoint - using enhancedTaskAPI for consistency
  throw new Error("Task update requires admin privileges");
};

/**
 * Delete task
 */
export const deleteTask = async (_taskId) => {
  // This would need admin endpoint - using enhancedTaskAPI for consistency
  throw new Error("Task deletion requires admin privileges");
};

/**
 * Apply for task
 */
export const applyForTask = async (taskId, applicationData) => {
  const token = localStorage.getItem("token");
  if (token) {
    enhancedTaskAPI.setToken(token);
  }

  return await enhancedTaskAPI.applyForTask(
    taskId,
    applicationData?.message || ""
  );
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = async (status) => {
  return getTasks({ status });
};

/**
 * Search tasks
 */
export const searchTasks = async (query) => {
  return getTasks({ search: query });
};

/**
 * Get user's applications
 */
export const getMyApplications = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch("/api/applications/my", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Raw applications response:", data);

    // Backend returns { success: true, data: { applications: [...] } }
    return data?.data?.applications || [];
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    return [];
  }
};
