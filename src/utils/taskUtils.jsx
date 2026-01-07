/**
 * Task-related utility functions
 * Contains date formatting, deadline status, and task submission helpers
 */

/**
 * Helper function to check if task is submitted late
 * @param {string} submittedAt - ISO date string of submission
 * @param {string} deadline - ISO date string of deadline
 * @returns {boolean} - True if task was submitted after deadline
 */
export const isTaskLate = (submittedAt, deadline) => {
  if (!submittedAt || !deadline) return false;
  return new Date(submittedAt) > new Date(deadline);
};

/**
 * Helper function to format dates for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString();
};

/**
 * Helper function to get deadline status with color coding
 * @param {string} deadline - ISO date string of deadline
 * @returns {Object} - Status object with text, color, and background color
 */
export const getDeadlineStatus = (deadline) => {
  if (!deadline) return "No deadline";
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)
    return { text: "Overdue", color: "text-red-500", bgColor: "bg-red-100" };
  if (daysLeft <= 2)
    return {
      text: `${daysLeft} days left`,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    };
  return {
    text: `${daysLeft} days left`,
    color: "text-green-500",
    bgColor: "bg-green-100",
  };
};

/**
 * Mock developers data (in real app, this would come from API/context)
 * This will be replaced when backend integration is complete
 */
export const DEVELOPERS = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
  { id: 4, name: "Alice Wilson", email: "alice@example.com" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com" },
];

/**
 * Enhanced animation variants for consistent motion design
 */
export const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
