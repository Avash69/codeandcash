/**
 * General application constants
 */

/**
 * Application routes
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  TASKS: {
    EXPLORE: "/tasks/explore",
    DETAILS: "/tasks/:id",
    APPLY: "/tasks/:id/apply",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    TASKS: "/admin/tasks",
    SUBMISSIONS: "/admin/submissions",
  },
};

/**
 * API endpoints (for future backend integration)
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/profile",
  },
  TASKS: {
    LIST: "/api/tasks",
    CREATE: "/api/tasks",
    UPDATE: "/api/tasks/:id",
    DELETE: "/api/tasks/:id",
    APPLY: "/api/tasks/:id/apply",
    CATEGORIES: "/api/tasks/categories",
    DIFFICULTIES: "/api/tasks/difficulties",
  },
  USERS: {
    LIST: "/api/users",
    PROFILE: "/api/users/:id",
  },
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  PREFERENCES: "preferences",
};

/**
 * Application themes
 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PRICE: 1,
  MAX_PRICE: 100000,
};
