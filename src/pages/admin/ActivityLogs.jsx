import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../api/adminService";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";

/**
 * Activity Logs Component
 *
 * Displays admin activity logs with filtering and pagination
 */
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const itemsPerPage = 20;

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getActivityLogs(
        currentPage,
        itemsPerPage
      );

      setLogs(response.logs || []);
      setTotalPages(response.totalPages || 1);
      setTotalLogs(response.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const getActionIcon = (action) => {
    const icons = {
      create: "➕",
      update: "✏️",
      delete: "🗑️",
      login: "🔐",
      logout: "🚪",
      approve: "✅",
      reject: "❌",
      status_change: "🔄",
      default: "📝",
    };

    return icons[action] || icons.default;
  };

  const getActionColor = (action) => {
    const colors = {
      create: "text-green-400",
      update: "text-blue-400",
      delete: "text-red-400",
      login: "text-purple-400",
      logout: "text-orange-400",
      approve: "text-green-400",
      reject: "text-red-400",
      status_change: "text-yellow-400",
      default: "text-gray-400",
    };

    return colors[action] || colors.default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-900/20 border border-red-500 rounded-lg">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Error Loading Activity Logs
        </h2>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchActivityLogs}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400">
            Monitor system activity and admin actions
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Logs</p>
          <p className="text-2xl font-bold text-white">{totalLogs}</p>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">
                  Action
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">
                  Resource
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">
                  Details
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <motion.tr
                    key={log._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getActionIcon(log.action)}
                        </span>
                        <span
                          className={`font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {log.resource}
                      </div>
                      {log.resourceId && (
                        <div className="text-sm text-gray-400">
                          ID: {log.resourceId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {log.user?.name || log.adminName || "System"}
                      </div>
                      {log.user?.email && (
                        <div className="text-sm text-gray-400">
                          {log.user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm max-w-md">
                        {log.details || log.description || "No details"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">
                        {formatDate(log.createdAt || log.timestamp)}
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
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
