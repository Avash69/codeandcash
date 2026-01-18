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
 * Refactored to Premium Light Theme
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
      setIsLoadingNewApplication(true);
      const taskTitle =
        location.state.newApplication?.taskTitle ||
        location.state.newApplication?.title ||
        "Unknown Task";

      setSuccessMessage(`✅ Successfully applied to "${taskTitle}"`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!isLoggedIn()) {
          navigate(ROUTES.LOGIN);
          return;
        }

        const currentUser = getCurrentUser();
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (!currentUser || !token) {
          handleAuthError();
          return;
        }

        setUser(currentUser);
      } catch (error) {
        handleAuthError();
      }
    };

    initializeAuth();
  }, [navigate, handleAuthError]);

  // Fetch API logic (preserved from original)
  const fetchAppliedTasksFromAPI = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) throw new Error("No authentication token found");

      const response = await getMyAppliedTasks({
        status: "all",
        limit: 50,
        page: 1,
      });

      let applications = [];
      if (response?.success && response?.data?.applications) {
        applications = response.data.applications;
      } else if (response?.data?.applications) {
        applications = response.data.applications;
      } else if (response?.applications) {
        applications = response.applications;
      } else if (response?.data && Array.isArray(response.data)) {
        applications = response.data;
      } else if (Array.isArray(response)) {
        applications = response;
      } else {
        return [];
      }
      return applications;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleAuthError();
        return [];
      }
      throw error;
    }
  }, [user, handleAuthError]);

  // Load tasks
  const loadAppliedTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const tasks = await fetchAppliedTasksFromAPI();
      const validTasks = Array.isArray(tasks) ? tasks : [];
      setAppliedTasks(validTasks);
      setFilteredTasks(validTasks);
    } catch (error) {
      setErrorMessage(`Failed to load your applied tasks: ${error.message}`);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      setAppliedTasks([]);
      setFilteredTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAppliedTasksFromAPI]);

  // Initial load
  useEffect(() => {
    if (user) {
      if (location.state?.refreshData) {
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

  const handleRefresh = useCallback(async () => {
    await loadAppliedTasks();
  }, [loadAppliedTasks]);

  // Debug API (Simplified for UI, logic preserved if needed but shortened for this view)
  const handleDebugAPI = useCallback(async () => {
    try {
      await loadAppliedTasks();
      alert("Refreshed data from API. Check console for details if needed.");
    } catch (e) {
      alert("Error refreshing data: " + e.message);
    }
  }, [loadAppliedTasks]);

  // Filter tasks
  useEffect(() => {
    const tasksToFilter = Array.isArray(appliedTasks) ? appliedTasks : [];
    const filtered = tasksToFilter.filter((task) => {
      if (!task) return false;
      const status = task.status || "pending";
      switch (activeFilter) {
        case "pending": return status === "pending";
        case "accepted": return status === "accepted";
        case "rejected": return status === "rejected";
        case "completed":
          return ["completed", "submitted", "approved", "verified", "done"].includes(status);
        default: return true;
      }
    });
    setFilteredTasks(filtered);
  }, [activeFilter, appliedTasks]);

  // File Upload
  const handleFileUpload = useCallback(async (applicationId, files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    try {
      setUploadingTaskId(applicationId);
      // Logic to find real ID preserved
      const realApplicationId = appliedTasks.find(
        t => t.applicationId === applicationId || t.id === applicationId || t._id === applicationId
      )?._id || applicationId;

      await submitFiles(realApplicationId, fileArray);

      // Optimistic update
      const updatedTasks = appliedTasks.map((task) => {
        const tId = task._id || task.applicationId || task.id;
        if (tId === realApplicationId) {
          return { ...task, status: "submitted", progress: 100 };
        }
        return task;
      });
      setAppliedTasks(updatedTasks);
      setSuccessMessage("Task submitted successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to submit task.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setUploadingTaskId(null);
    }
  },
    [appliedTasks]
  );

  const filterOptions = [
    { key: "all", label: "All Tasks" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
    { key: "completed", label: "Completed" },
  ];

  // UI Components
  const ToastNotification = ({ message, type, show, onClose }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed z-50 flex items-center max-w-md px-4 py-3 border rounded-lg shadow-lg top-4 right-4 backdrop-blur-sm ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          <span className="mr-2 text-lg">{type === 'success' ? '✅' : '❌'}</span>
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-slate-200 animate-spin border-t-indigo-600"></div>
          <h2 className="text-xl font-semibold text-text-primary">Loading your tasks...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastNotification message={successMessage} type="success" show={showSuccessToast} onClose={() => setShowSuccessToast(false)} />
      <ToastNotification message={errorMessage} type="error" show={showErrorToast} onClose={() => setShowErrorToast(false)} />

      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">My Applied Tasks</h1>
                <p className="mt-1 text-text-secondary">Track your applications and tasks progress</p>
              </div>
              <button onClick={handleRefresh} className="px-4 py-2 bg-slate-100 text-text-secondary hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-8">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === option.key
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {filteredTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-sm border border-border">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📂</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No tasks found</h3>
              <p className="text-text-secondary mb-6">
                {activeFilter === 'all'
                  ? "You haven't applied to any tasks yet."
                  : `No tasks found with status "${activeFilter}"`}
              </p>
              <Link to="/exploretask" className="px-6 py-3 bg-primary text-white rounded-xl shadow-md hover:bg-primary-hover transition-colors inline-block">
                Explore Tasks
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task._id || task.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <TaskStatusBadge status={task.status} />
                            <span className="text-sm text-text-muted">
                              Applied on {formatDate(task.appliedAt || task.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-text-primary mb-2">
                            {task.taskId?.title || task.task?.title || task.title || "Untitled Task"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              {task.taskId?.company || task.task?.company || "Company"}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              ${(task.taskId?.payout || task.task?.payout || task.payout || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                          {(task.status === "accepted" || task.status === "pending") && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Actions</p>
                              {task.status === "accepted" ? (
                                <label className={`flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${uploadingTaskId === (task._id || task.id) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover cursor-pointer'} transition-colors`}>
                                  {uploadingTaskId === (task._id || task.id) ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                      Submit Work
                                    </>
                                  )}
                                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(task._id || task.id, e.target.files)} disabled={uploadingTaskId === (task._id || task.id)} />
                                </label>
                              ) : (
                                <button disabled className="w-full px-4 py-2 bg-slate-200 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                  Awaiting Approval
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyAppliedTasks;
