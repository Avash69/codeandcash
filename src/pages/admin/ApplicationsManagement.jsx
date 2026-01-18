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
 * Refactored to Premium Light Theme.
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

  const itemsPerPage = 20;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      const response = await adminService.getApplications(
        currentPage,
        itemsPerPage,
        filters
      );

      if (response?.applications) {
        setApplications(response.applications);
        setTotalPages(
          response.totalPages || Math.ceil(response.total / itemsPerPage)
        );
        setTotalApplications(response.total || response.applications.length);
      } else if (Array.isArray(response)) {
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
      await adminService.updateApplicationStatus(
        applicationId,
        status,
        feedback
      );

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

      fetchApplications();
    } catch (err) {
      setError(`Error updating applications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewApplicationDetails = async (applicationId) => {
    try {
      setLoading(true);
      const details = await adminService.getApplicationDetails(applicationId);
      setSelectedApplication(details);
      setShowDetailsModal(true);
    } catch (err) {
      setError(`Error fetching application details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSubmissionFile = async (applicationId, file) => {
    try {
      let url = "";
      if (file.completedTaskId) {
        url = `/api/completed-tasks/${file.completedTaskId}/download`;
      } else {
        url = `/api/admin/applications/${applicationId}/download/${file._id || file.id
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
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      submitted: "bg-blue-100 text-blue-700 border-blue-200",
      needs_revision: "bg-orange-100 text-orange-700 border-orange-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      in_review: "bg-purple-100 text-purple-700 border-purple-200",
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config}`}>
        {status?.replace('_', ' ') || "unknown"}
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
      <div className="max-w-md p-6 mx-auto border border-red-200 rounded-lg bg-red-50">
        <h2 className="mb-2 text-xl font-bold text-red-700">Error</h2>
        <p className="mb-4 text-red-600">{error}</p>
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Application Management
          </h1>
          <p className="text-text-secondary mt-1">Review and process applications</p>
        </div>

        <div className="text-sm text-text-muted">
          Total:{" "}
          <span className="font-semibold text-text-primary">{totalApplications}</span>{" "}
          applications
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-text-primary placeholder-text-muted border rounded-lg bg-white border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Search applications..."
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
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="submitted">Submitted</option>
          <option value="needs_revision">Needs Revision</option>
          <option value="in_review">In Review</option>
        </select>
      </div>

      {/* Success Messages */}
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
      </AnimatePresence>

      {/* Bulk actions */}
      {selectedApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-between gap-4 p-4 border rounded-lg bg-indigo-50 border-indigo-100 sm:flex-row"
        >
          <div className="text-text-primary font-medium">
            <span className="font-bold text-primary">{selectedApplications.length}</span>{" "}
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
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 shadow-sm"
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
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Reject Selected</span>
            </button>

            <button
              onClick={() => setSelectedApplications([])}
              className="px-4 py-2 text-text-secondary transition-colors rounded-lg bg-white border border-border hover:bg-slate-50"
            >
              Clear Selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Applications table */}
      <div className="bg-white border rounded-xl border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    className="text-primary rounded border-gray-300 focus:ring-primary"
                    checked={
                      applications.length > 0 &&
                      selectedApplications.length === applications.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Applicant
                </th>
                <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Task</th>
                <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Submitted
                </th>
                <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-text-muted">
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
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="text-primary rounded border-gray-300 focus:ring-primary"
                        checked={selectedApplications.includes(app._id || app.id)}
                        onChange={() =>
                          handleApplicationSelect(app._id || app.id)
                        }
                      />
                    </td>
                    <td className="p-4 font-medium text-text-primary">
                      {app.userId?.name ||
                        app.user?.name ||
                        app.userName ||
                        "Unknown User"}
                    </td>
                    <td className="p-4 text-text-secondary max-w-[200px] truncate">
                      {app.taskId?.title ||
                        app.task?.title ||
                        app.taskTitle ||
                        "Unknown Task"}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(app.status || "pending")}
                    </td>
                    <td className="p-4 text-text-secondary text-sm">
                      {app.submissions && app.submissions.length > 0
                        ? `${app.submissions.length} file${app.submissions.length > 1 ? "s" : ""
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
                          className="p-2 text-text-secondary transition-colors rounded-lg hover:text-primary hover:bg-indigo-50"
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
                          className="p-2 text-text-secondary transition-colors rounded-lg hover:text-green-600 hover:bg-green-50"
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
                          className="p-2 text-text-secondary transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
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
      </div>

      {/* Pagination */}
      {applications.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-text-secondary">
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
                  <span className="font-semibold text-text-primary">
                    {bulkStatusUpdate.status}
                  </span>
                  .
                </p>
                <div>
                  <label className="block mb-2 text-sm font-medium text-text-secondary">
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
                    className="w-full px-3 py-2 text-text-primary placeholder-text-muted border rounded-lg bg-white border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

      {/* Application details modal - Refactored for Light Theme */}
      <AnimatePresence>
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text-primary">
                    Application Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedApplication(null);
                    }}
                    className="p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-text-muted uppercase tracking-wider font-semibold">Applicant</h3>
                      <p className="text-lg font-medium text-text-primary">
                        {selectedApplication.user?.name ||
                          selectedApplication.userName ||
                          "Unknown User"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-text-muted uppercase tracking-wider font-semibold">Task</h3>
                      <p className="text-lg font-medium text-text-primary">
                        {selectedApplication.task?.title ||
                          selectedApplication.taskTitle ||
                          "Unknown Task"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-text-muted uppercase tracking-wider font-semibold">Status</h3>
                      <p className="mt-1">
                        {getStatusBadge(
                          selectedApplication.status || "pending"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-text-muted uppercase tracking-wider font-semibold">Submitted On</h3>
                      <p className="text-lg font-medium text-text-primary">
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
                      <h3 className="text-sm text-text-muted uppercase tracking-wider font-semibold">Attachments</h3>
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
                                className="flex items-center gap-2 px-3 py-2 text-indigo-700 transition-colors rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
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
                                <span className="ml-2 text-xs text-text-muted">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-muted italic">
                          {selectedApplication.status === "submitted"
                            ? "No files found"
                            : "No files uploaded"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm text-text-muted uppercase tracking-wider font-semibold">
                    Application Message
                  </h3>
                  <div className="p-4 text-text-secondary border rounded-lg bg-slate-50 border-border">
                    {selectedApplication.message ||
                      selectedApplication.coverLetter ||
                      "No message provided"}
                  </div>
                </div>

                {selectedApplication.feedback && (
                  <div>
                    <h3 className="mb-2 text-sm text-text-muted uppercase tracking-wider font-semibold">Feedback</h3>
                    <div className="p-4 text-text-secondary border rounded-lg bg-indigo-50 border-indigo-100">
                      {typeof selectedApplication.feedback === "object"
                        ? selectedApplication.feedback.comment ||
                        "No feedback provided"
                        : selectedApplication.feedback}
                      {selectedApplication.feedback &&
                        typeof selectedApplication.feedback === "object" &&
                        selectedApplication.feedback.providedAt && (
                          <div className="mt-2 text-xs text-text-muted">
                            Provided:{" "}
                            {formatDate(
                              selectedApplication.feedback.providedAt
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border mt-6">
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
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 shadow-sm"
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
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
                    disabled={selectedApplication.status === "rejected"}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 text-text-secondary bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors ml-auto"
                  >
                    Close
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
