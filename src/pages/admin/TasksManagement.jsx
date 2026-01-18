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
  Clock,
  DollarSign,
  Briefcase,
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
 * A clean, simplified tasks management interface aligned with backend API endpoints.
 * Refactored to Premium Light Theme with expanded Create/Edit forms.
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

  const itemsPerPage = 20;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      };

      const response = await adminService.getTasks(
        currentPage,
        itemsPerPage,
        filters
      );

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
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const pageParam = params.get("page");

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
      await Promise.all(
        selectedTasks.map((taskId) => adminService.deleteTask(taskId))
      );

      setTasks((prev) =>
        prev.filter((task) => !selectedTasks.includes(task._id || task.id))
      );
      setTotalTasks((prev) => prev - selectedTasks.length);
      setSelectedTasks([]);
      setActionSuccess(`${selectedTasks.length} tasks deleted successfully`);
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
      await adminService.createTask(newTask);

      setShowCreateModal(false);
      setShowCreateToast(true);
      if (createToastTimeout.current) clearTimeout(createToastTimeout.current);
      createToastTimeout.current = setTimeout(() => {
        setShowCreateToast(false);
      }, 1000);
      fetchTasks();
    } catch (err) {
      setError(`Failed to create task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      setLoading(true);
      await adminService.updateTask(
        currentTask._id || currentTask.id,
        taskData
      );

      setShowEditModal(false);
      setCurrentTask(null);
      setActionSuccess("Task updated successfully");
      fetchTasks();
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
    } catch (err) {
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
    } catch (err) {
      return "$0.00";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
      cancelled: "bg-slate-100 text-slate-700 border-slate-200",
      open: "bg-emerald-100 text-emerald-700 border-emerald-200",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      unknown: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusConfig[status] || statusConfig.unknown
          }`}
      >
        {status?.replace('_', ' ') || "unknown"}
      </span>
    );
  };

  if (loading && tasks.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <AnimatePresence>
        {showCreateToast && (
          <motion.div
            key="task-created-toast"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className="fixed z-50 top-8 right-8 flex items-center px-6 py-4 rounded-xl shadow-xl bg-white border border-green-200"
          >
            <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-full">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-base font-semibold text-text-primary">
              Task Created Successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Task Management</h1>
            <p className="text-text-secondary mt-1">Create and manage tasks</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-primary rounded-lg hover:bg-primary-hover shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 text-text-primary placeholder-text-muted border rounded-lg bg-white border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="px-4 py-2 text-text-primary border rounded-lg bg-white border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            className="px-4 py-2 text-text-primary border rounded-lg bg-white border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

        {/* Success/Error Messages */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-4 text-green-700 border rounded-lg bg-green-50 border-green-200"
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
              className="flex items-center gap-2 p-4 text-red-700 border rounded-lg bg-red-50 border-red-200"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                className="ml-auto text-red-500 hover:text-red-700"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-between gap-4 p-4 border rounded-lg bg-indigo-50 border-indigo-100 sm:flex-row"
          >
            <div className="text-text-primary font-medium">
              <span className="font-bold text-primary">{selectedTasks.length}</span> tasks selected
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
              >
                <Trash className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedTasks([])}
                className="px-4 py-2 text-text-secondary transition-colors rounded-lg bg-white border border-border hover:bg-slate-50"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="bg-white border rounded-xl border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      className="text-primary rounded border-gray-300 focus:ring-primary"
                      checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Payout</th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-text-muted">
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
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="text-primary rounded border-gray-300 focus:ring-primary"
                          checked={selectedTasks.includes(task._id || task.id)}
                          onChange={() => toggleTaskSelection(task._id || task.id)}
                        />
                      </td>
                      <td className="p-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="truncate max-w-[200px]" title={task.title}>
                            {task.title || "Untitled Task"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary capitalize">
                        {task.category || "Uncategorized"}
                      </td>
                      <td className="p-4 font-medium text-text-primary">
                        {formatCurrency(task.payout)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="p-4 text-text-secondary text-sm">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setCurrentTask(task);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-text-secondary transition-colors rounded-lg hover:text-primary hover:bg-indigo-50"
                            title="Edit Task"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => confirmDeleteTask(task)}
                            className="p-2 text-text-secondary transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
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
        </div>

        {/* Pagination */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-text-secondary">
              Showing {Math.min(itemsPerPage, tasks.length)} of {totalTasks} tasks
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showDeleteModal && (
            <ConfirmationModal
              title="Delete Task"
              message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
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

        <AnimatePresence>
          {showCreateModal && (
            <CreateTaskModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleCreateTask}
            />
          )}
        </AnimatePresence>

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

// Expanded Create Task Modal with user requested fields
const CreateTaskModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "frontend",
    difficulty: "medium",
    payout: "",
    company: "",
    duration: "", // Input as string, converted to number
    requirements: "", // Input as string, converted to array
    deliverables: "", // Input as string, converted to array
    status: "open"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.title || !formData.payout || !formData.company || !formData.duration) {
        throw new Error("Title, Company, Payout, and Duration are required");
      }

      // Process data for backend
      const taskData = {
        ...formData,
        payout: Number(formData.payout),
        duration: Number(formData.duration), // Ensure duration is a number
        requirements: formData.requirements ? formData.requirements.split('\n').filter(line => line.trim() !== '') : [],
        deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(line => line.trim() !== '') : []
      };

      if (isNaN(taskData.duration)) throw new Error("Duration must be a number (days)");
      if (isNaN(taskData.payout)) throw new Error("Payout must be a number");

      await onSuccess(taskData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Task Name (Title)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full pl-10 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="e.g. Build a React Dashboard" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Company Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input name="company" value={formData.company} onChange={handleChange} className="w-full pl-10 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="e.g. Codexa Inc." required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Payout ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input name="payout" type="number" value={formData.payout} onChange={handleChange} className="w-full pl-10 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="e.g. 500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Duration (Days)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input name="duration" type="number" min="1" max="365" value={formData.duration} onChange={handleChange} className="w-full pl-10 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="e.g. 14" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="mobile">Mobile</option>
                  <option value="design">Design</option>
                  <option value="devops">DevOps</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none" placeholder="Detailed description of the task..." required></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Requirements (One per line)</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none" placeholder="React.js expert&#10;Node.js knowledge&#10;..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Deliverables (One per line)</label>
                <textarea name="deliverables" value={formData.deliverables} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none" placeholder="GitHub Repository&#10;Live Demo URL&#10;..."></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-text-secondary font-medium hover:bg-white border border-transparent hover:border-border rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all transform active:scale-95">
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Expanded Edit Task Modal
const EditTaskModal = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    category: task.category || "frontend",
    difficulty: task.difficulty || "medium",
    payout: task.payout || "",
    company: task.company || "",
    status: task.status || "open",
    duration: task.duration || "",
    requirements: Array.isArray(task.requirements) ? task.requirements.join('\n') : (task.requirements || ""),
    deliverables: Array.isArray(task.deliverables) ? task.deliverables.join('\n') : (task.deliverables || "")
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const taskData = {
        ...task,
        ...formData,
        payout: Number(formData.payout),
        duration: Number(formData.duration),
        requirements: formData.requirements.split('\n').filter(line => line.trim() !== ''),
        deliverables: formData.deliverables.split('\n').filter(line => line.trim() !== '')
      };

      if (isNaN(taskData.duration)) throw new Error("Duration must be a number (days)");
      if (isNaN(taskData.payout)) throw new Error("Payout must be a number");

      await onSuccess(taskData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-xl font-bold text-text-primary">Edit Task</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Task Name (Title)</label>
                <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Company Name</label>
                <input name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Payout ($)</label>
                <input name="payout" type="number" value={formData.payout} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Duration (Days)</label>
                <input name="duration" type="number" min="1" max="365" value={formData.duration} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="mobile">Mobile</option>
                  <option value="design">Design</option>
                  <option value="devops">DevOps</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none" required></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Requirements (One per line)</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Deliverables (One per line)</label>
                <textarea name="deliverables" value={formData.deliverables} onChange={handleChange} className="w-full p-3 border border-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary outline-none"></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-text-secondary font-medium hover:bg-white border border-transparent hover:border-border rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all transform active:scale-95">
              {loading ? "Save Changes" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TasksManagement;
