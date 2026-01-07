import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../api/adminService";

/**
 * Submissions Management Component
 *
 * Provides comprehensive submission management functionality including:
 * - View all submissions with pagination
 * - Filter by status, task, user
 * - Search submissions
 * - Download submission files
 * - Update submission status
 * - Leave feedback
 * - Approve/reject submissions
 */
const SubmissionsManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Removed unused selection and bulk action state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submissionToReview, setSubmissionToReview] = useState(null);

  const itemsPerPage = 10;

  // Fetch completed tasks with user and file info for admin
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the completed-tasks endpoint for admin
      const data = await adminService.getCompletedTasks(
        currentPage,
        itemsPerPage
      );

      // Expecting: Array of completed task applications, each with user info and file submissions
      if (data?.data) {
        setSubmissions(data.data);
        setTotalPages(1); // Adjust if backend supports pagination
      } else if (Array.isArray(data)) {
        setSubmissions(data);
        setTotalPages(1);
      } else {
        setSubmissions([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Download file by fileId (or filename if that's the unique identifier)
  const handleDownloadFile = async (file) => {
    try {
      // If file has a direct path/url, use it; otherwise, use the adminService
      if (file.path) {
        window.open(file.path, "_blank");
      } else if (file._id) {
        await adminService.downloadSubmission(file._id);
      } else {
        setError("No file path or id available for download.");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error downloading file:", err);
    }
  };

  const handleUpdateStatus = async (submissionId, newStatus, feedback = "") => {
    try {
      // Using PATCH /api/admin/submissions/:submissionId/status endpoint
      await adminService.updateSubmissionStatus(
        submissionId,
        newStatus,
        feedback
      );
      setSubmissions(
        submissions.map((submission) =>
          submission.id === submissionId
            ? { ...submission, status: newStatus, feedback }
            : submission
        )
      );
      setShowFeedbackModal(false);
      setSubmissionToReview(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating submission status:", err);
    }
  };

  // Removed unused bulk action and selection handlers

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Removed unused getStatusBadge

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Submissions Management
          </h1>
          <p className="text-gray-400">Review and manage task submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-red-500 rounded-lg bg-red-900/20">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Search
            </label>
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs-revision">Needs Revision</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Task
            </label>
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tasks</option>
              {/* Task options would be populated from API */}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Actions
            </label>
            <button
              onClick={fetchSubmissions}
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions removed (no longer needed) */}

      {/* Submissions Table (Completed Tasks with User and File Info) */}
      <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-300 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-300 uppercase">
                  Task
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-300 uppercase">
                  Files
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-300 uppercase">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No completed submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((submission, idx) => (
                  <tr
                    key={submission._id || idx}
                    className="hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-indigo-600 rounded-full">
                          <span className="text-sm font-medium text-white">
                            {submission.user?.name?.[0] || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {submission.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {submission.user?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {submission.task?.title || "Untitled Task"}
                        </p>
                        <p className="text-sm text-gray-400">
                          ID: {submission.task?._id || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {Array.isArray(submission.files) &&
                        submission.files.length > 0 ? (
                          submission.files.map((file, index) => (
                            <button
                              key={file._id || file.filename || index}
                              onClick={() => handleDownloadFile(file)}
                              className="block text-sm text-left text-indigo-400 hover:text-indigo-300"
                              title={file.originalName || file.filename}
                            >
                              📁 {file.originalName || file.filename}
                              {file.size && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              )}
                              {file.uploadedAt && (
                                <span className="ml-2 text-xs text-gray-500">
                                  {formatDate(file.uploadedAt)}
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">
                            No files
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(
                        submission.submittedAt ||
                          submission.completedAt ||
                          submission.createdAt
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, submissions.length)} of{" "}
          {submissions.length} submissions
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && submissionToReview && (
        <FeedbackModal
          submission={submissionToReview}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleUpdateStatus}
        />
      )}
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal = ({ submission, onClose, onSubmit }) => {
  const [status, setStatus] = useState(submission.status);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(submission.id, status, feedback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="mb-6 text-2xl font-bold text-white">
          Review Submission
        </h3>

        <div className="mb-6">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="mb-2 text-lg font-semibold text-white">
              Task: {submission.taskTitle}
            </h4>
            <p className="mb-2 text-gray-300">
              Submitted by: {submission.userName}
            </p>
            <p className="mb-4 text-gray-300">
              Submitted on: {formatDate(submission.submittedAt)}
            </p>

            {submission.files && submission.files.length > 0 && (
              <div>
                <h5 className="mb-2 font-medium text-white">Files:</h5>
                <div className="space-y-1">
                  {submission.files.map((file, index) => (
                    <button
                      key={index}
                      className="block text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      📁 {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs-revision">Needs Revision</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Feedback
            </label>
            <textarea
              rows="6"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the submission..."
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionsManagement;
