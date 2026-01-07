import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMyAppliedTasks, submitFiles } from "../../api/appliedTasksService";
import { getCurrentUser, isLoggedIn } from "../../api/authService";
import {
  ScrollReveal,
  ScrollRevealGroup,
} from "../../components/ScrollAnimation";
import { TaskStatusBadge } from "../../components/ui/TaskStatusBadge";
import { ROUTES, STORAGE_KEYS } from "../../constants/appConstants";
import { formatDate } from "../../utils/taskUtils";

/**
 * My Applied Tasks Page Component
 *
 * FIXED ISSUES:
 * 1. ✅ Enhanced token management as per integration guide
 * 2. ✅ Proper authentication error handling with 401/403 detection
 * 3. ✅ Token persistence across page reloads
 * 4. ✅ Improved error handling for backend API responses
 * 5. ✅ Better debugging tools for API troubleshooting
 */
const MyAppliedTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingNewApplication, setIsLoadingNewApplication] = useState(false);

  // Authentication error handler
  const handleAuthError = useCallback(() => {
    console.log("🔒 Authentication error detected, clearing session");
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  // Check for new application from navigation state
  useEffect(() => {
    if (location.state?.refreshData && location.state?.newApplication) {
      console.log("New application detected:", location.state.newApplication);
      setIsLoadingNewApplication(true);

      // FIXED: Safely access taskTitle with proper fallback
      const taskTitle =
        location.state.newApplication?.taskTitle ||
        location.state.newApplication?.title ||
        "Unknown Task";

      setSuccessMessage(`✅ Successfully applied to "${taskTitle}"`);
      setShowSuccessToast(true);

      // Auto-hide toast after 4 seconds
      setTimeout(() => setShowSuccessToast(false), 4000);

      // Clear navigation state to prevent repeated processing
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  // ENHANCED: Initialize authentication with improved token management
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing authentication...");

        // Check if user is logged in
        if (!isLoggedIn()) {
          console.log("❌ User not logged in, redirecting to login");
          navigate(ROUTES.LOGIN);
          return;
        }

        // Get current user and token
        const currentUser = getCurrentUser();
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        console.log("👤 Current user:", currentUser?.email || "Unknown");
        console.log("🔑 Token present:", !!token);

        // Validate user and token
        if (!currentUser || !token) {
          console.log("❌ Missing user data or token");
          handleAuthError();
          return;
        }

        // CRITICAL: Set token in enhanced API instance
        console.log("✅ Token set in API instance and global variable");

        // Test token validity with a simple API call
        try {
          console.log("🧪 Testing token validity...");
          await getMyAppliedTasks({
            status: "all",
            limit: 1,
            page: 1,
          });
          console.log("✅ Token is valid");
        } catch (tokenError) {
          console.error("❌ Token validation failed:", tokenError);

          // Check if it's an authentication error
          if (
            tokenError.message.includes("401") ||
            tokenError.message.includes("403") ||
            tokenError.message.includes("Unauthorized") ||
            tokenError.message.includes("Forbidden") ||
            tokenError.status === 401 ||
            tokenError.status === 403
          ) {
            console.log("🔒 Token is invalid or expired");
            handleAuthError();
            return;
          }

          // If it's not an auth error, we can continue (might be server issue)
          console.log(
            "⚠️ Non-auth error during token validation, continuing..."
          );
        }

        setUser(currentUser);
        console.log("✅ Authentication initialization complete");
      } catch (error) {
        console.error("❌ Authentication initialization failed:", error);
        handleAuthError();
      }
    };

    initializeAuth();
  }, [navigate, handleAuthError]);

  // ENHANCED: Better API debugging and error handling
  const fetchAppliedTasksFromAPI = useCallback(async () => {
    try {
      console.log("=== FETCHING APPLIED TASKS ===");
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log("🔑 Token present:", !!token);
      console.log("👤 User ID:", user?.id || user?._id || "Unknown");

      // Ensure token is set in API instance
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Make API call with enhanced error handling
      const response = await getMyAppliedTasks({
        status: "all",
        limit: 50,
        page: 1,
      });

      console.log("=== API RESPONSE ANALYSIS ===");
      console.log("📊 Full Response:", JSON.stringify(response, null, 2));
      console.log("🔍 Response Type:", typeof response);
      console.log(
        "🗝️ Response Keys:",
        response ? Object.keys(response) : "No response"
      );

      // Handle different possible response structures based on backend documentation
      let applications = [];

      if (
        response?.success &&
        response?.data?.applications &&
        Array.isArray(response.data.applications)
      ) {
        applications = response.data.applications;
        console.log(
          "✅ Using response.data.applications (standard backend format)"
        );
      } else if (
        response?.data?.applications &&
        Array.isArray(response.data.applications)
      ) {
        applications = response.data.applications;
        console.log("✅ Using response.data.applications");
      } else if (
        response?.applications &&
        Array.isArray(response.applications)
      ) {
        applications = response.applications;
        console.log("✅ Using response.applications");
      } else if (response?.data && Array.isArray(response.data)) {
        applications = response.data;
        console.log("✅ Using response.data as array");
      } else if (Array.isArray(response)) {
        applications = response;
        console.log("✅ Using response as direct array");
      } else {
        console.warn("⚠️ Unexpected API response structure");
        console.warn(
          "📋 Expected backend format: { success: true, data: { applications: [...] } }"
        );
        console.warn("📋 Received:", response);

        // Check if response indicates an error
        if (response?.error || response?.message) {
          throw new Error(
            response.error || response.message || "Invalid response format"
          );
        }

        return [];
      }

      console.log("=== FINAL RESULT ===");
      console.log("📈 Applications Count:", applications.length);

      if (applications.length > 0) {
        console.log("📋 Sample Application:", applications[0]);

        // Analyze what fields are present in the first application
        const sampleApp = applications[0];
        console.log(
          "🔍 Available fields in application:",
          Object.keys(sampleApp)
        );

        // Check for nested task object
        if (sampleApp.task) {
          console.log(
            "📋 Task object found with fields:",
            Object.keys(sampleApp.task)
          );
        }

        // Check for missing critical fields
        const criticalFields = ["id", "status", "appliedAt"];
        const missingFields = criticalFields.filter(
          (field) => !sampleApp[field]
        );

        if (missingFields.length > 0) {
          console.warn("⚠️ Missing critical fields:", missingFields);
        }
      } else {
        console.log(
          "ℹ️ No applications found - this could be normal for new users"
        );
      }

      return applications;
    } catch (error) {
      console.error("=== API ERROR ===");
      console.error("❌ Error Message:", error.message);
      console.error("🔢 Error Status:", error.status);
      console.error("📋 Error Response:", error.response?.data);
      console.error("🔍 Full Error:", error);

      // ENHANCED: Better authentication error detection
      const isAuthError =
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden") ||
        error.message.includes("token") ||
        error.message.includes("auth") ||
        error.status === 401 ||
        error.status === 403;

      if (isAuthError) {
        console.log("🔒 Authentication error detected");
        handleAuthError();
        return [];
      }

      throw error;
    }
  }, [user, handleAuthError]);

  // Load applied tasks from API
  const loadAppliedTasks = useCallback(async () => {
    console.log("🔄 Starting to load applied tasks...");
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      console.log("⏰ Loading timeout reached");
      setIsLoading(false);
      setErrorMessage("Request took too long. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    }, 15000);

    try {
      const tasks = await fetchAppliedTasksFromAPI();
      clearTimeout(timeoutId);

      const validTasks = Array.isArray(tasks) ? tasks : [];
      console.log("✅ Setting applied tasks:", validTasks.length, "tasks");

      setAppliedTasks(validTasks);
      setFilteredTasks(validTasks);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ Error loading applied tasks:", error);
      setErrorMessage(`Failed to load your applied tasks: ${error.message}`);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);

      setAppliedTasks([]);
      setFilteredTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAppliedTasksFromAPI]);

  // Load applied tasks when user is set
  useEffect(() => {
    if (user) {
      console.log(
        "👤 Loading applied tasks for user:",
        user.email || user.username || user.id
      );

      if (location.state?.refreshData) {
        console.log("⏳ Delaying load for new application processing...");
        setTimeout(() => {
          loadAppliedTasks().finally(() => {
            setIsLoadingNewApplication(false);
          });
        }, 1500);
      } else {
        loadAppliedTasks();
      }
    }
  }, [user, loadAppliedTasks, location.state]);

  // Refresh functionality
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    await loadAppliedTasks();
  }, [loadAppliedTasks]);

  // ENHANCED: Debug function with field analysis
  const handleDebugAPI = useCallback(async () => {
    console.log("🐛 ENHANCED DEBUG API CALL");
    console.log("👤 User:", user?.email || "Unknown");
    console.log(
      "🔑 Token:",
      localStorage.getItem(STORAGE_KEYS.TOKEN) ? "Present" : "Missing"
    );

    try {
      // Test token first
      console.log("🧪 Testing API connection...");
      const response = await getMyAppliedTasks({
        status: "all",
        limit: 10,
        page: 1,
      });

      // Analyze response structure
      let applications = [];
      if (
        response?.data?.applications &&
        Array.isArray(response.data.applications)
      ) {
        applications = response.data.applications;
      } else if (
        response?.applications &&
        Array.isArray(response.applications)
      ) {
        applications = response.applications;
      } else if (response?.data && Array.isArray(response.data)) {
        applications = response.data;
      } else if (Array.isArray(response)) {
        applications = response;
      }

      // Field analysis
      const fieldAnalysis = {
        totalApplications: applications.length,
        sampleApplication: applications[0] || null,
        commonFields: [],
        missingFields: [],
        taskFields: [],
        missingTaskFields: [],
      };

      if (applications.length > 0) {
        const sample = applications[0];
        fieldAnalysis.commonFields = Object.keys(sample);

        // Check for critical application fields
        const criticalAppFields = [
          "id",
          "status",
          "appliedAt",
          "progress",
          "submittedAt",
        ];
        fieldAnalysis.missingFields = criticalAppFields.filter(
          (field) => !sample[field]
        );

        // Check task object
        if (sample.task) {
          fieldAnalysis.taskFields = Object.keys(sample.task);
          const criticalTaskFields = [
            "id",
            "title",
            "description",
            "payout",
            "company",
            "difficulty",
          ];
          fieldAnalysis.missingTaskFields = criticalTaskFields.filter(
            (field) => !sample.task[field]
          );
        }
      }

      const debugInfo = {
        success: true,
        apiResponse: {
          structure: typeof response,
          keys: response ? Object.keys(response) : null,
          hasData: !!response?.data,
          hasApplications: !!response?.applications,
          isDirectArray: Array.isArray(response),
        },
        fieldAnalysis,
        recommendations: [],
      };

      // Generate recommendations
      if (fieldAnalysis.missingFields.length > 0) {
        debugInfo.recommendations.push(
          `Missing application fields: ${fieldAnalysis.missingFields.join(
            ", "
          )}`
        );
      }
      if (fieldAnalysis.missingTaskFields.length > 0) {
        debugInfo.recommendations.push(
          `Missing task fields: ${fieldAnalysis.missingTaskFields.join(", ")}`
        );
      }
      if (applications.length === 0) {
        debugInfo.recommendations.push(
          "No applications found - user may not have applied to any tasks yet"
        );
      }

      console.log("✅ Debug Analysis:", debugInfo);
      alert(`API Debug Analysis:\n${JSON.stringify(debugInfo, null, 2)}`);
    } catch (error) {
      const debugError = {
        success: false,
        message: error.message,
        status: error.status,
        response: error.response?.data,
        isAuthError:
          error.message.includes("401") ||
          error.message.includes("403") ||
          error.status === 401 ||
          error.status === 403,
        recommendations: [],
      };

      if (debugError.isAuthError) {
        debugError.recommendations.push(
          "Authentication failed - check token validity"
        );
        debugError.recommendations.push("Try logging out and logging back in");
      } else {
        debugError.recommendations.push("Check backend server status");
        debugError.recommendations.push("Verify API endpoint configuration");
      }

      console.error("❌ Debug Error:", debugError);
      alert(`API Error Analysis:\n${JSON.stringify(debugError, null, 2)}`);
    }
  }, [user]);

  // Filter tasks based on active filter
  useEffect(() => {
    const tasksToFilter = Array.isArray(appliedTasks) ? appliedTasks : [];

    const filtered = tasksToFilter.filter((task) => {
      if (!task) return false;

      switch (activeFilter) {
        case "pending":
          return task.status === "pending";
        case "accepted":
          return task.status === "accepted";
        case "rejected":
          return task.status === "rejected";
        case "completed":
          // Show both 'completed' and 'submitted' statuses
          return task.status === "completed" || task.status === "submitted";
        default:
          return true;
      }
    });
    setFilteredTasks(filtered);
  }, [activeFilter, appliedTasks]);

  // Handle file upload for task submission
  const handleFileUpload = useCallback(
    async (applicationId, files) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.isArray(files) ? files : [files];

      try {
        setUploadingTaskId(applicationId);
        // Always use MongoDB ObjectId if available for file submission
        const realApplicationId =
          appliedTasks.find(
            (task) =>
              task.applicationId === applicationId ||
              task.id === applicationId ||
              task._id === applicationId
          )?._id || applicationId;
        const result = await submitFiles(realApplicationId, fileArray);

        const updatedTasks = appliedTasks.map((task) => {
          const taskAppId = task._id || task.applicationId || task.id;
          if (taskAppId === realApplicationId) {
            return {
              ...task,
              status: "submitted",
              submissionFile: fileArray[0].name,
              submittedAt: new Date().toISOString(),
              progress: result.application?.progress || 100,
              timeRemaining: "Submitted",
              lastUpdated: new Date().toISOString(),
              submissionCount:
                result.application?.submissions?.length || fileArray.length,
              submissions: result.application?.submissions || [],
            };
          }
          return task;
        });

        setAppliedTasks(updatedTasks);

        const fileNames = fileArray.map((f) => f.name).join(", ");
        setSuccessMessage(`Task submitted successfully! Files: ${fileNames}`);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage(
          error.message || "Failed to submit task. Please try again."
        );
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
      } finally {
        setUploadingTaskId(null);
      }
    },
    [appliedTasks]
  );

  // Get progress color based on percentage
  // Always show 100% progress for completed/submitted tasks
  const getProgressColor = (progress, status) => {
    if (status === "completed" || status === "submitted") {
      return "from-emerald-500 to-green-500";
    }
    if (progress >= 100) return "from-emerald-500 to-green-500";
    if (progress >= 75) return "from-blue-500 to-indigo-500";
    if (progress >= 50) return "from-yellow-500 to-orange-500";
    return "from-gray-500 to-gray-600";
  };

  // Filter options based on standard backend statuses (show both 'completed' and 'submitted' for completed tab)
  const filterOptions = [
    {
      key: "all",
      label: "All Tasks",
      count: Array.isArray(appliedTasks) ? appliedTasks.length : 0,
    },
    {
      key: "pending",
      label: "Pending",
      count: Array.isArray(appliedTasks)
        ? appliedTasks.filter((t) => t && t.status === "pending").length
        : 0,
    },
    {
      key: "accepted",
      label: "Accepted",
      count: Array.isArray(appliedTasks)
        ? appliedTasks.filter((t) => t && t.status === "accepted").length
        : 0,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: Array.isArray(appliedTasks)
        ? appliedTasks.filter((t) => t && t.status === "rejected").length
        : 0,
    },
    {
      key: "completed",
      label: "Completed",
      count: Array.isArray(appliedTasks)
        ? appliedTasks.filter(
            (t) => t && (t.status === "completed" || t.status === "submitted")
          ).length
        : 0,
    },
  ];

  // Toast notification component
  const ToastNotification = ({ message, type, show, onClose }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed z-50 flex items-center max-w-md px-4 py-3 border rounded-lg shadow-lg top-4 right-4 backdrop-blur-sm"
          style={{
            background:
              type === "success"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)",
            borderColor:
              type === "success"
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(239, 68, 68, 0.3)",
          }}
        >
          <div className="flex items-start">
            {type === "success" ? (
              <svg
                className="w-5 h-5 mr-2 text-green-100 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2 text-red-100 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="text-sm font-medium text-white">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-white transition-colors hover:text-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-transparent"></div>
        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-indigo-500/30 animate-spin border-t-indigo-500"></div>
              <div
                className="absolute w-12 h-12 mx-auto transform -translate-x-1/2 border-4 rounded-full top-2 left-1/2 border-purple-500/30 animate-spin border-t-purple-500"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-50">
              {user ? "Loading Your Applied Tasks" : "Checking Authentication"}
            </h2>
            <p className="text-slate-400">
              {user
                ? "Please wait while we fetch your task applications..."
                : "Please wait while we verify your login status..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotification
        message={successMessage}
        type="success"
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <ToastNotification
        message={errorMessage}
        type="error"
        show={showErrorToast}
        onClose={() => setShowErrorToast(false)}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,_#000_0deg,_#1e1b4b_120deg,_#312e81_240deg,_#000_360deg)] opacity-10"></div>

        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-slate-50 via-indigo-200 to-purple-200 bg-clip-text sm:text-4xl">
                      My Applied Tasks
                    </h1>
                    <p className="mt-2 text-slate-300">
                      Track your task applications and submit completed work
                    </p>
                    {isLoadingNewApplication && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-indigo-300">
                        <div className="w-4 h-4 border-2 border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
                        <span>Processing your new application...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="items-center hidden px-3 py-2 font-medium text-white transition-all duration-200 rounded-lg shadow-lg sm:inline-flex bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className={`w-4 h-4 mr-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </button>
                    <button
                      onClick={handleDebugAPI}
                      className="items-center hidden px-3 py-2 font-medium text-white transition-all duration-200 bg-yellow-600 rounded-lg shadow-lg sm:inline-flex hover:bg-yellow-500"
                    >
                      🐛 Debug API
                    </button>
                    <Link
                      to="/exploretask"
                      className="items-center hidden px-4 py-2 font-medium text-white transition-all duration-200 rounded-lg shadow-lg sm:inline-flex bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Explore More Tasks
                    </Link>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setActiveFilter(option.key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                        activeFilter === option.key
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {option.label}
                      {option.count > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeFilter === option.key
                              ? "bg-white/20 text-white"
                              : "bg-slate-600/50 text-slate-400"
                          }`}
                        >
                          {option.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Tasks Grid or Empty State */}
            <ScrollRevealGroup>
              {filteredTasks.length === 0 ? (
                <ScrollReveal>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="py-16 text-center"
                  >
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                      <svg
                        className="w-12 h-12 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-50">
                      {activeFilter === "all"
                        ? "No Applied Tasks Yet"
                        : `No ${
                            filterOptions.find((f) => f.key === activeFilter)
                              ?.label
                          } Tasks`}
                    </h3>
                    <p className="mb-6 text-slate-400">
                      {activeFilter === "all"
                        ? "Start by exploring and applying for tasks that match your skills."
                        : `You don't have any ${filterOptions
                            .find((f) => f.key === activeFilter)
                            ?.label.toLowerCase()} tasks at the moment.`}
                    </p>
                    <div className="space-y-4">
                      <Link
                        to="/exploretask"
                        className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Explore Available Tasks
                      </Link>
                      <div>
                        <button
                          onClick={handleDebugAPI}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-yellow-600 rounded-lg shadow-lg hover:bg-yellow-500"
                        >
                          🐛 Debug API Response
                        </button>
                        <p className="mt-2 text-xs text-slate-500">
                          Click to see the raw API response and help
                          troubleshoot the issue
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredTasks.map((application, index) => {
                    // Handle both old format and new API format
                    const task = application.task || application;

                    // Always use MongoDB ObjectId for all task-related actions, fallback to id for legacy/mock data
                    const taskId = task._id || task.id;
                    // Application ID should also prefer _id (for new backend), fallback to id
                    const applicationId =
                      application._id || application.id || taskId;
                    // Compose applicationData with all relevant fields
                    const applicationData = {
                      ...application,
                      id: applicationId,
                      status: application.status,
                    };
                    if (!task || (!taskId && !applicationId)) return null;

                    return (
                      <ScrollReveal key={applicationId}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl group-hover:opacity-100 blur-xl"></div>
                          <div className="relative p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-xl rounded-2xl border-white/20 hover:shadow-2xl">
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="mb-1 text-lg font-semibold text-slate-50 line-clamp-1">
                                  {task.title || "Untitled Task"}
                                </h3>
                                <p className="mb-2 text-sm text-slate-400">
                                  {task.company ||
                                    task.client?.name ||
                                    "Unknown Company"}
                                </p>
                                <div className="flex items-center gap-2 mb-3">
                                  <TaskStatusBadge
                                    status={
                                      applicationData.status ||
                                      task.status ||
                                      "unknown"
                                    }
                                  />
                                  <span className="px-2 py-1 text-xs rounded-full text-slate-400 bg-slate-700/50">
                                    {task.difficulty || "Medium"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-400">
                                  $
                                  {(
                                    task.payout ||
                                    task.price ||
                                    0
                                  ).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400">
                                  Applied{" "}
                                  {formatDate(
                                    applicationData.appliedAt ||
                                      application.appliedAt
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Task Description */}
                            <p className="mb-4 text-sm text-slate-300 line-clamp-2">
                              {task.description || "No description available"}
                            </p>

                            {/* Progress Bar - Only show if progress is available */}
                            {(applicationData.progress !== undefined ||
                              task.progress !== undefined) && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-300">
                                    Progress
                                  </span>
                                  <span className="text-sm font-bold text-slate-50">
                                    {applicationData.status === "completed" ||
                                    applicationData.status === "submitted"
                                      ? 100
                                      : applicationData.progress ||
                                        task.progress ||
                                        0}
                                    %
                                  </span>
                                </div>
                                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-700/50">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${
                                        applicationData.status ===
                                          "completed" ||
                                        applicationData.status === "submitted"
                                          ? 100
                                          : applicationData.progress ||
                                            task.progress ||
                                            0
                                      }%`,
                                    }}
                                    transition={{
                                      duration: 1,
                                      delay: index * 0.1,
                                    }}
                                    className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
                                      applicationData.status === "completed" ||
                                        applicationData.status === "submitted"
                                        ? 100
                                        : applicationData.progress ||
                                            task.progress ||
                                            0,
                                      applicationData.status
                                    )}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Link
                                to={`/task-details/${taskId}`}
                                className="flex-1 px-3 py-2 text-sm font-medium text-center transition-all duration-200 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                              >
                                View Details
                              </Link>

                              {/* File upload - only for accepted applications */}
                              {applicationData.status === "accepted" &&
                                !applicationData.submittedAt && (
                                  <div className="flex-1">
                                    <label className="relative cursor-pointer">
                                      <input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        multiple
                                        onChange={(e) =>
                                          handleFileUpload(
                                            applicationId,
                                            Array.from(e.target.files)
                                          )
                                        }
                                        className="hidden"
                                        disabled={
                                          uploadingTaskId === applicationId
                                        }
                                      />
                                      <div
                                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                                          uploadingTaskId === applicationId
                                            ? "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl"
                                        }`}
                                      >
                                        {uploadingTaskId === applicationId
                                          ? "Uploading..."
                                          : "Submit Work"}
                                      </div>
                                    </label>
                                  </div>
                                )}

                              {applicationData.submittedAt && (
                                <div className="flex-1 px-3 py-2 text-sm font-medium text-center text-purple-200 rounded-lg bg-purple-500/20">
                                  ✓ Submitted
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </ScrollRevealGroup>

            {/* Quick Stats */}
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 gap-4 mt-12 md:grid-cols-4"
              >
                {[
                  {
                    label: "Total Applied",
                    value: Array.isArray(appliedTasks)
                      ? appliedTasks.length
                      : 0,
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    label: "In Progress",
                    value: Array.isArray(appliedTasks)
                      ? appliedTasks.filter(
                          (t) =>
                            t &&
                            (t.status === "in-progress" ||
                              t.status === "approved" ||
                              t.status === "accepted")
                        ).length
                      : 0,
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    label: "Submitted",
                    value: Array.isArray(appliedTasks)
                      ? appliedTasks.filter(
                          (t) =>
                            t &&
                            (t.status === "submitted" ||
                              t.status === "completed")
                        ).length
                      : 0,
                    color: "from-purple-500 to-indigo-500",
                  },
                ].map((stat, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300`}
                    ></div>
                    <div className="relative p-4 text-center border bg-white/10 backdrop-blur-xl rounded-xl border-white/20">
                      <div
                        className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAppliedTasks;
