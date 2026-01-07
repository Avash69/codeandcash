import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Download,
  ExternalLink,
  Eye,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../api/adminService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";

/**
 * Applications Management Component
 *
 * A clean, simplified applications management interface aligned with backend API endpoints:
 * - List Applications: GET /api/admin/applications?page=1&limit=20&filter=
 * - Get Application Details: GET /api/admin/applications/:id
 * - Update Application Status: PATCH /api/admin/applications/:id/status
 * - Bulk Status Update: PATCH /api/admin/applications/bulk-update
 * - Download Submission File: GET /api/admin/applications/:id/download/:fileId
 */
const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState({
    status: "",
    feedback: "",
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const itemsPerPage = 20; // Matches the API limit parameter

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      // API endpoint: GET /api/admin/applications?page=1&limit=20&filter=
      const response = await adminService.getApplications(
        currentPage,
        itemsPerPage,
        filters
      );

      // Debug log: print the raw response and each application object
      console.log("Applications API response:", response);
      if (response?.applications) {
        console.log("Applications array:", response.applications);
        response.applications.forEach((app, idx) => {
          console.log(`Application[${idx}]:`, app);
        });
        setApplications(response.applications);
        setTotalPages(
          response.totalPages || Math.ceil(response.total / itemsPerPage)
        );
        setTotalApplications(response.total || response.applications.length);
      } else if (Array.isArray(response)) {
        console.log("Applications array:", response);
        response.forEach((app, idx) => {
          console.log(`Application[${idx}]:`, app);
        });
        setApplications(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalApplications(response.length);
      } else {
        setApplications([]);
        setTotalPages(1);
        setTotalApplications(0);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (applicationId, status, feedback = "") => {
    try {
      setLoading(true);

      // API endpoint: PATCH /api/admin/applications/:id/status
      await adminService.updateApplicationStatus(
        applicationId,
        status,
        feedback
      );

      // Update the local state to reflect the change
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === applicationId || app.id === applicationId
            ? { ...app, status, feedback }
            : app
        )
      );

      setActionSuccess(`Application status updated to ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Error updating application status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedApplications.length === 0 || !bulkStatusUpdate.status) {
      return;
    }

    try {
      setLoading(true);

      // API endpoint: PATCH /api/admin/applications/bulk-update
      await adminService.bulkUpdateApplications(
        selectedApplications,
        bulkStatusUpdate.status,
        bulkStatusUpdate.feedback
      );

      setSelectedApplications([]);
      setBulkStatusUpdate({ status: "", feedback: "" });
      setShowStatusModal(false);

      setActionSuccess(
        `Updated ${selectedApplications.length} applications to ${bulkStatusUpdate.status}`
      );
      setTimeout(() => setActionSuccess(null), 3000);

      fetchApplications(); // Refresh the list
    } catch (err) {
      setError(`Error updating applications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewApplicationDetails = async (applicationId) => {
    try {
      setLoading(true);

      // API endpoint: GET /api/admin/applications/:id
      const details = await adminService.getApplicationDetails(applicationId);

      setSelectedApplication(details);
      setShowDetailsModal(true);
    } catch (err) {
      setError(`Error fetching application details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced download handler: supports both TaskApplication and CompletedTask endpoints
  const downloadSubmissionFile = async (applicationId, file) => {
    try {
      let url = "";
      if (file.completedTaskId) {
        url = `/api/completed-tasks/${file.completedTaskId}/download`;
      } else {
        url = `/api/admin/applications/${applicationId}/download/${
          file._id || file.id
        }`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("File not found or server error");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.originalName || file.filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(`Error downloading file: ${err.message}`);
    }
  };

  const handleApplicationSelect = (applicationId) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app._id || app.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      accepted: "bg-green-500/20 text-green-400 border-green-500/40",
      rejected: "bg-red-500/20 text-red-400 border-red-500/40",
      submitted: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      needs_revision: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      approved: "bg-green-500/20 text-green-400 border-green-500/40", // Alias for accepted
      in_review: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2.5 py-1 text-xs rounded-full border ${config}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && applications.length === 0) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-md p-6 mx-auto border border-red-500 rounded-lg bg-red-900/20">
        <h2 className="mb-2 text-xl font-bold text-red-400">Error</h2>
        <p className="mb-4 text-red-300">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-white">
          Application Management
        </h1>

        <div className="text-sm text-gray-400">
          Total:{" "}
          <span className="font-semibold text-white">{totalApplications}</span>{" "}
          applications
        </div>
      </div>

      {/* Filters and search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search applications..."
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
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="submitted">Submitted</option>
          <option value="needs_revision">Needs Revision</option>
          <option value="in_review">In Review</option>
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
      {selectedApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-between gap-4 p-4 border rounded-lg bg-white/5 border-white/10 sm:flex-row"
        >
          <div className="text-white">
            <span className="font-medium">{selectedApplications.length}</span>{" "}
            applications selected
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setBulkStatusUpdate({
                  status: "accepted",
                  feedback: "Your application has been accepted",
                });
                setShowStatusModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Accept Selected</span>
            </button>

            <button
              onClick={() => {
                setBulkStatusUpdate({
                  status: "rejected",
                  feedback: "Your application has been rejected",
                });
                setShowStatusModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Reject Selected</span>
            </button>

            <button
              onClick={() => setSelectedApplications([])}
              className="px-4 py-2 text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
            >
              Clear Selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Applications table */}
      <div className="relative overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  className="text-indigo-500 rounded bg-white/10 border-white/20 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-transparent"
                  checked={
                    applications.length > 0 &&
                    selectedApplications.length === applications.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-4 text-sm font-medium text-gray-300">
                Applicant
              </th>
              <th className="p-4 text-sm font-medium text-gray-300">Task</th>
              <th className="p-4 text-sm font-medium text-gray-300">Status</th>
              <th className="p-4 text-sm font-medium text-gray-300">
                Submitted
              </th>
              <th className="p-4 text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  {loading
                    ? "Loading applications..."
                    : "No applications found"}
                </td>
              </tr>
            ) : (
              applications.map((app, index) => (
                <motion.tr
                  key={app._id || app.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition-colors border-t border-white/5 hover:bg-white/5"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="text-indigo-500 rounded bg-white/10 border-white/20 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-transparent"
                      checked={selectedApplications.includes(app._id || app.id)}
                      onChange={() =>
                        handleApplicationSelect(app._id || app.id)
                      }
                    />
                  </td>
                  <td className="p-4 font-medium text-white">
                    {app.userId?.name ||
                      app.user?.name ||
                      app.userName ||
                      "Unknown User"}
                  </td>
                  <td className="p-4 text-gray-300 max-w-[200px] truncate">
                    {app.taskId?.title ||
                      app.task?.title ||
                      app.taskTitle ||
                      "Unknown Task"}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(app.status || "pending")}
                  </td>
                  <td className="p-4 text-gray-400">
                    {app.submissions && app.submissions.length > 0
                      ? `${app.submissions.length} file${
                          app.submissions.length > 1 ? "s" : ""
                        } (${formatDate(
                          app.submissions[0]?.uploadedAt ||
                            app.submittedAt ||
                            app.createdAt
                        )})`
                      : app.status === "submitted"
                      ? "Submitted (no files)"
                      : "No submissions"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          viewApplicationDetails(app._id || app.id)
                        }
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            app._id || app.id,
                            "accepted",
                            "Your application has been accepted"
                          )
                        }
                        className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                        title="Accept Application"
                        disabled={app.status === "accepted"}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            app._id || app.id,
                            "rejected",
                            "Your application has been rejected"
                          )
                        }
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Reject Application"
                        disabled={app.status === "rejected"}
                      >
                        <ThumbsDown className="w-4 h-4" />
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
      {applications.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {Math.min(itemsPerPage, applications.length)} of{" "}
            {totalApplications} applications
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Bulk status update modal */}
      <AnimatePresence>
        {showStatusModal && (
          <ConfirmationModal
            title={`Update ${selectedApplications.length} Applications`}
            message={
              <div className="space-y-4">
                <p>
                  You're about to change the status of{" "}
                  {selectedApplications.length} applications to{" "}
                  <span className="font-semibold text-white">
                    {bulkStatusUpdate.status}
                  </span>
                  .
                </p>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Feedback (optional):
                  </label>
                  <textarea
                    value={bulkStatusUpdate.feedback}
                    onChange={(e) =>
                      setBulkStatusUpdate({
                        ...bulkStatusUpdate,
                        feedback: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-white placeholder-gray-500 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add feedback for applicants..."
                    rows={3}
                  />
                </div>
              </div>
            }
            confirmText={`Update to ${bulkStatusUpdate.status}`}
            cancelText="Cancel"
            onConfirm={handleBulkStatusUpdate}
            onCancel={() => {
              setShowStatusModal(false);
              setBulkStatusUpdate({ status: "", feedback: "" });
            }}
            isOpen={showStatusModal}
            isDanger={bulkStatusUpdate.status === "rejected"}
          />
        )}
      </AnimatePresence>

      {/* Application details modal */}
      <AnimatePresence>
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Application Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedApplication(null);
                    }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-400">Applicant</h3>
                      <p className="text-lg font-medium text-white">
                        {selectedApplication.user?.name ||
                          selectedApplication.userName ||
                          "Unknown User"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400">Task</h3>
                      <p className="text-lg font-medium text-white">
                        {selectedApplication.task?.title ||
                          selectedApplication.taskTitle ||
                          "Unknown Task"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400">Status</h3>
                      <p className="mt-1">
                        {getStatusBadge(
                          selectedApplication.status || "pending"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-400">Submitted On</h3>
                      <p className="text-lg font-medium text-white">
                        {selectedApplication.submissions &&
                        selectedApplication.submissions.length > 0
                          ? formatDate(
                              selectedApplication.submissions[0]?.uploadedAt ||
                                selectedApplication.submittedAt ||
                                selectedApplication.createdAt
                            )
                          : selectedApplication.status === "submitted"
                          ? formatDate(
                              selectedApplication.submittedAt ||
                                selectedApplication.createdAt
                            )
                          : formatDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400">Last Updated</h3>
                      <p className="text-lg font-medium text-white">
                        {formatDate(selectedApplication.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400">Attachments</h3>
                      {selectedApplication.submissions &&
                      selectedApplication.submissions.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {selectedApplication.submissions.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  downloadSubmissionFile(
                                    selectedApplication._id ||
                                      selectedApplication.id,
                                    file
                                  )
                                }
                                className="flex items-center gap-2 p-2 text-indigo-400 transition-colors rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
                              >
                                <Download className="w-4 h-4" />
                                <span>
                                  {file.originalName ||
                                    file.filename ||
                                    `File ${idx + 1}`}
                                </span>
                              </button>
                              {/* Basic file info UI */}
                              {file.size && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              )}
                              {file.uploadedAt && (
                                <span className="ml-2 text-xs text-gray-500">
                                  {formatDate(file.uploadedAt)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          {selectedApplication.status === "submitted"
                            ? "No files found"
                            : "No files uploaded"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm text-gray-400">
                    Application Message
                  </h3>
                  <div className="p-4 text-gray-300 border rounded-lg bg-white/5 border-white/10">
                    {selectedApplication.message ||
                      selectedApplication.coverLetter ||
                      "No message provided"}
                  </div>
                </div>

                {selectedApplication.feedback && (
                  <div>
                    <h3 className="mb-2 text-sm text-gray-400">Feedback</h3>
                    <div className="p-4 text-gray-300 border rounded-lg bg-white/5 border-white/10">
                      {typeof selectedApplication.feedback === "object"
                        ? selectedApplication.feedback.comment ||
                          "No feedback provided"
                        : selectedApplication.feedback}
                      {selectedApplication.feedback &&
                        typeof selectedApplication.feedback === "object" &&
                        selectedApplication.feedback.providedAt && (
                          <div className="mt-2 text-xs text-gray-400">
                            Provided:{" "}
                            {formatDate(
                              selectedApplication.feedback.providedAt
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      handleStatusUpdate(
                        selectedApplication._id || selectedApplication.id,
                        "accepted",
                        "Your application has been accepted"
                      );
                      setShowDetailsModal(false);
                      setSelectedApplication(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    disabled={selectedApplication.status === "accepted"}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Accept Application</span>
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate(
                        selectedApplication._id || selectedApplication.id,
                        "rejected",
                        "Your application has been rejected"
                      );
                      setShowDetailsModal(false);
                      setSelectedApplication(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                    disabled={selectedApplication.status === "rejected"}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate(
                        selectedApplication._id || selectedApplication.id,
                        "needs_revision",
                        "Your application needs some revisions"
                      );
                      setShowDetailsModal(false);
                      setSelectedApplication(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-amber-600 hover:bg-amber-700"
                    disabled={selectedApplication.status === "needs_revision"}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Request Revision</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationsManagement;
