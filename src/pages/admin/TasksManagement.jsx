import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Edit,
  FileText,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminService } from "../../api/adminService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";

/**
 * Tasks Management Component
 *
 * A clean, simplified tasks management interface aligned with backend API endpoints:
 * - List Tasks: GET /api/admin/tasks?page=1&limit=20&filter=
 * - Get Task Details: GET /api/admin/tasks/:id
 * - Create Task: POST /api/admin/tasks
 * - Edit Task: PUT /api/admin/tasks/:id
 * - Delete Task: DELETE /api/admin/tasks/:id
 */
const TasksManagement = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showCreateToast, setShowCreateToast] = useState(false);
  const createToastTimeout = useRef(null);

  const itemsPerPage = 20; // Matches the API limit parameter

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      };

      // API endpoint: GET /api/admin/tasks?page=1&limit=20&filter=
      const response = await adminService.getTasks(
        currentPage,
        itemsPerPage,
        filters
      );

      // Handle different response formats from backend
      if (response?.tasks) {
        setTasks(response.tasks);
        setTotalPages(
          response.totalPages || Math.ceil(response.total / itemsPerPage)
        );
        setTotalTasks(response.total || response.tasks.length);
      } else if (Array.isArray(response)) {
        setTasks(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalTasks(response.length);
      } else {
        setTasks([]);
        setTotalPages(1);
        setTotalTasks(0);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const pageParam = params.get("page");

    // Apply filters from URL if they exist
    if (statusParam) setStatusFilter(statusParam);
    if (categoryParam) setCategoryFilter(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (pageParam) setCurrentPage(parseInt(pageParam, 10));
  }, [location.search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const confirmDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);

      // API endpoint: DELETE /api/admin/tasks/:id
      await adminService.deleteTask(taskToDelete._id || taskToDelete.id);

      setTasks((prev) =>
        prev.filter(
          (task) =>
            (task._id || task.id) !== (taskToDelete._id || taskToDelete.id)
        )
      );
      setSelectedTasks((prev) =>
        prev.filter((id) => id !== (taskToDelete._id || taskToDelete.id))
      );
      setTotalTasks((prev) => prev - 1);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      setActionSuccess("Task deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      setLoading(true);

      // Perform multiple DELETE requests for each selected task
      await Promise.all(
        selectedTasks.map((taskId) => adminService.deleteTask(taskId))
      );

      setTasks((prev) =>
        prev.filter((task) => !selectedTasks.includes(task._id || task.id))
      );
      setTotalTasks((prev) => prev - selectedTasks.length);
      setSelectedTasks([]);
      setActionSuccess(`${selectedTasks.length} tasks deleted successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      setLoading(true);

      // API endpoint: POST /api/admin/tasks
      await adminService.createTask(newTask);

      setShowCreateModal(false);
      setShowCreateToast(true);
      if (createToastTimeout.current) clearTimeout(createToastTimeout.current);
      createToastTimeout.current = setTimeout(() => {
        setShowCreateToast(false);
      }, 1000);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError(`Failed to create task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      setLoading(true);

      // API endpoint: PUT /api/admin/tasks/:id
      await adminService.updateTask(
        currentTask._id || currentTask.id,
        taskData
      );

      setShowEditModal(false);
      setCurrentTask(null);
      setActionSuccess("Task updated successfully");
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedTasks((prev) =>
      prev.length === tasks.length
        ? []
        : tasks.map((task) => task._id || task.id)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.warn("Invalid date format:", dateString);
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount || 0);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.warn("Invalid amount format:", amount);
      return "$0.00";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-green-500 text-white",
      inactive: "bg-red-500 text-white",
      pending: "bg-yellow-500 text-white",
      completed: "bg-blue-500 text-white",
      cancelled: "bg-gray-500 text-white",
      open: "bg-green-500 text-white",
      in_progress: "bg-blue-500 text-white",
      unknown: "bg-gray-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          statusConfig[status] || statusConfig.unknown
        }`}
      >
        {status || "unknown"}
      </span>
    );
  };

  if (loading && tasks.length === 0) {
    return <Loading />;
  }

  return (
    <>
      {/* Toast for Task Created */}
      <AnimatePresence>
        {showCreateToast && (
          <motion.div
            key="task-created-toast"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="fixed z-50 top-8 right-8 flex items-center px-6 py-4 rounded-xl shadow-2xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-2 border-green-400/60 backdrop-blur-lg min-w-[220px]"
          >
            <svg
              className="w-6 h-6 mr-3 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="#22c55e"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4"
                stroke="#fff"
              />
            </svg>
            <div className="text-base font-semibold text-white drop-shadow">
              Task Created
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl font-bold text-white">Task Management</h1>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="px-4 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>

          <select
            className="px-4 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Full Stack</option>
            <option value="mobile">Mobile</option>
            <option value="design">Design</option>
            <option value="devops">DevOps</option>
          </select>
        </div>

        {/* Success and error messages */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-4 text-green-400 border rounded-lg bg-green-500/10 border-green-500/20"
            >
              <Check className="w-5 h-5" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-4 text-red-400 border rounded-lg bg-red-500/10 border-red-500/20"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                className="ml-auto text-red-400 hover:text-red-300"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk actions */}
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-between gap-4 p-4 border rounded-lg bg-white/5 border-white/10 sm:flex-row"
          >
            <div className="text-white">
              <span className="font-medium">{selectedTasks.length}</span> tasks
              selected
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedTasks([])}
                className="px-4 py-2 text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Tasks table */}
        <div className="relative overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    className="text-indigo-500 rounded bg-white/10 border-white/20 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-transparent"
                    checked={
                      tasks.length > 0 && selectedTasks.length === tasks.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4 text-sm font-medium text-gray-300">Title</th>
                <th className="p-4 text-sm font-medium text-gray-300">
                  Category
                </th>
                <th className="p-4 text-sm font-medium text-gray-300">
                  Payout
                </th>
                <th className="p-4 text-sm font-medium text-gray-300">
                  Status
                </th>
                <th className="p-4 text-sm font-medium text-gray-300">
                  Created
                </th>
                <th className="p-4 text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    {loading ? "Loading tasks..." : "No tasks found"}
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <motion.tr
                    key={task._id || task.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="text-indigo-500 rounded bg-white/10 border-white/20 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-transparent"
                        checked={selectedTasks.includes(task._id || task.id)}
                        onChange={() =>
                          toggleTaskSelection(task._id || task.id)
                        }
                      />
                    </td>
                    <td className="p-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="truncate max-w-[200px]">
                          {task.title || "Untitled Task"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {task.category || "Uncategorized"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {formatCurrency(task.payout)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(task.status || "unknown")}
                    </td>
                    <td className="p-4 text-gray-400">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentTask(task);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                          title="Edit Task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => confirmDeleteTask(task)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Task"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {Math.min(itemsPerPage, tasks.length)} of {totalTasks}{" "}
              tasks
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <ConfirmationModal
              title="Delete Task"
              message={`Are you sure you want to delete the task "${taskToDelete?.title}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={handleDeleteTask}
              onCancel={() => {
                setShowDeleteModal(false);
                setTaskToDelete(null);
              }}
              isOpen={showDeleteModal}
              isDanger={true}
            />
          )}
        </AnimatePresence>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTaskModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleCreateTask}
            />
          )}
        </AnimatePresence>

        {/* Edit Task Modal */}
        <AnimatePresence>
          {showEditModal && currentTask && (
            <EditTaskModal
              task={currentTask}
              onClose={() => {
                setShowEditModal(false);
                setCurrentTask(null);
              }}
              onSuccess={handleEditTask}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Advanced Create Task Modal Component
const CreateTaskModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "medium",
    payout: "",
    company: "",
    deadline: "",
    requirements: "",
    deliverables: "",
    status: "open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Field validation
  const validateField = (name, value) => {
    if (
      !value &&
      ["title", "description", "category", "difficulty", "payout"].includes(
        name
      )
    ) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (name === "category" && value) {
      const validCategories = [
        "frontend",
        "backend",
        "fullstack",
        "mobile",
        "design",
        "devops",
      ];
      if (!validCategories.includes(value)) {
        return "Category must be one of: frontend, backend, fullstack, mobile, design, devops";
      }
    }

    if (name === "difficulty" && value) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (!validDifficulties.includes(value)) {
        return "Difficulty must be one of: easy, medium, hard";
      }
    }

    if (name === "payout" && (isNaN(value) || parseFloat(value) <= 0)) {
      return "Payout must be a positive number";
    }

    if (name === "deadline" && value) {
      const deadlineDate = new Date(value);
      if (isNaN(deadlineDate.getTime())) {
        return "Invalid date format";
      }
      if (deadlineDate < new Date()) {
        return "Deadline cannot be in the past";
      }
    }

    return null;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Required fields for all steps
    const requiredFields = [
      "title",
      "description",
      "category",
      "difficulty",
      "payout",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleNextStep = (e) => {
    // Prevent form submission on Enter key or button click
    if (e) e.preventDefault();
    // Validate current step before proceeding
    if (validateForm()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare task data according to API spec
      const taskData = {
        ...formData,
        payout: parseFloat(formData.payout),
        status: "open",
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
      };

      // API endpoint: POST /api/admin/tasks
      await adminService.createTask(taskData);

      onSuccess(taskData);
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress indicators for form steps
  const renderStepIndicators = () => (
    <div className="flex justify-center mb-6">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
            idx + 1 === step
              ? "bg-indigo-500 scale-125"
              : idx + 1 < step
              ? "bg-green-500"
              : "bg-gray-600"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-3xl p-6 mx-4 overflow-hidden border border-gray-700 shadow-2xl rounded-xl bg-gradient-to-br from-gray-900 to-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Header with Step Indicators */}
        <div className="relative mb-6 text-center">
          <div className="absolute left-0 -translate-y-1/2 top-1/2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600/20">
              <span className="text-lg font-semibold text-indigo-400">
                {step}/{totalSteps}
              </span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
            {step === 1 ? "Create New Task" : "Task Details"}
          </h3>

          {renderStepIndicators()}

          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 text-gray-400 transition-colors rounded-full hover:text-white hover:bg-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 border rounded-lg border-red-500/50 bg-red-500/10 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-red-400">There was a problem</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 ml-auto text-red-400 hover:text-red-300"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Basic Task Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Title field */}
              <div>
                <label className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-300">
                  Task Title
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for the task"
                  className={`w-full px-4 py-3 text-white bg-gray-800/50 border ${
                    validationErrors.title
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                />
                {validationErrors.title && (
                  <p className="mt-1 text-xs text-red-400">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-300">
                  Description
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the task requirements"
                  className={`w-full px-4 py-3 text-white bg-gray-800/50 border ${
                    validationErrors.description
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-300">
                    Category
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 text-white bg-gray-800/50 border ${
                      validationErrors.category
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  >
                    <option value="">Select Category</option>
                    <option value="frontend">Frontend Development</option>
                    <option value="backend">Backend Development</option>
                    <option value="fullstack">Full Stack Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">UI/UX Design</option>
                    <option value="devops">DevOps</option>
                  </select>
                  {validationErrors.category && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-300">
                    Difficulty
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-white transition-colors border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Payout and Company */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-300">
                    Payout ($)
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      name="payout"
                      min="0"
                      step="0.01"
                      value={formData.payout}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`w-full pl-8 px-4 py-3 text-white bg-gray-800/50 border ${
                        validationErrors.payout
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                    />
                  </div>
                  {validationErrors.payout && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.payout}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name (optional)"
                    className="w-full px-4 py-3 text-white transition-colors border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Additional Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Deadline */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formatDate(formData.deadline)}
                  onChange={handleInputChange}
                  min={formatDate(new Date())}
                  className={`w-full px-4 py-3 text-white bg-gray-800/50 border ${
                    validationErrors.deadline
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                />
                {validationErrors.deadline && (
                  <p className="mt-1 text-xs text-red-400">
                    {validationErrors.deadline}
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="List any specific requirements for this task"
                  className="w-full px-4 py-3 text-white transition-colors border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Deliverables
                </label>
                <textarea
                  name="deliverables"
                  rows="3"
                  value={formData.deliverables}
                  onChange={handleInputChange}
                  placeholder="Describe what should be delivered upon completion"
                  className="w-full px-4 py-3 text-white transition-colors border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Initial Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-white transition-colors border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Navigation and Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="flex items-center px-4 py-2 text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600"
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
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain layout
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center px-5 py-2 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-5 py-2 text-white transition-all bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Create Task
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple Edit Task Modal Component
const EditTaskModal = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    category: task.category || "",
    difficulty: task.difficulty || "medium",
    payout: task.payout || task.price || "",
    company: task.company || "",
    requirements: task.requirements || "",
    deliverables: task.deliverables || "",
    deadline: task.deadline || "",
    status: task.status || "open",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const validateField = (name, value) => {
    if (
      !value &&
      ["title", "description", "category", "difficulty", "payout"].includes(
        name
      )
    ) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (name === "category" && value) {
      const validCategories = [
        "frontend",
        "backend",
        "fullstack",
        "mobile",
        "design",
        "devops",
      ];
      if (!validCategories.includes(value)) {
        return "Category must be one of: frontend, backend, fullstack, mobile, design, devops";
      }
    }

    if (name === "difficulty" && value) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (!validDifficulties.includes(value)) {
        return "Difficulty must be one of: easy, medium, hard";
      }
    }

    if (name === "payout" && (isNaN(value) || parseFloat(value) <= 0)) {
      return "Payout must be a positive number";
    }

    if (name === "deadline" && value) {
      const deadlineDate = new Date(value);
      if (isNaN(deadlineDate.getTime())) {
        return "Invalid date format";
      }
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "title",
      "description",
      "category",
      "difficulty",
      "payout",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare task data according to API spec
      const taskData = {
        ...formData,
        payout: parseFloat(formData.payout),
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
      };

      await adminService.updateTask(task._id || task.id, taskData);

      onSuccess(taskData);
    } catch (err) {
      setError(err.message || "Failed to update task. Please try again.");
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 text-2xl font-bold text-white">Edit Task</h3>

        {error && (
          <div className="p-4 mb-6 border border-red-500 rounded-lg bg-red-900/20">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                  validationErrors.title ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.title}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                  validationErrors.category
                    ? "border-red-500"
                    : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Category</option>
                <option value="frontend">Frontend Development</option>
                <option value="backend">Backend Development</option>
                <option value="fullstack">Full Stack Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="design">UI/UX Design</option>
                <option value="devops">DevOps</option>
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.category}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                  validationErrors.difficulty
                    ? "border-red-500"
                    : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {validationErrors.difficulty && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.difficulty}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Payout ($)
              </label>
              <input
                type="number"
                name="payout"
                min="0"
                step="0.01"
                required
                value={formData.payout}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                  validationErrors.payout ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.payout && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.payout}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                validationErrors.description
                  ? "border-red-500"
                  : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-xs text-red-400">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formatDate(formData.deadline)}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-white bg-gray-700 border ${
                  validationErrors.deadline
                    ? "border-red-500"
                    : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.deadline && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.deadline}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Requirements
            </label>
            <textarea
              name="requirements"
              rows="3"
              value={formData.requirements}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Deliverables
            </label>
            <textarea
              name="deliverables"
              rows="3"
              value={formData.deliverables}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TasksManagement;
