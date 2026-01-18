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

      // Handle response structure similar to getUsers/getTasks
      if (response?.logs) {
        setLogs(response.logs);
        setTotalPages(response.totalPages || 1);
        setTotalLogs(response.total || response.logs.length);
      } else if (Array.isArray(response)) {
        setLogs(response);
        setTotalPages(1);
        setTotalLogs(response.length);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotalLogs(0);
      }

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
    // Updated for light theme colors
    const colors = {
      create: "text-emerald-600 bg-emerald-50 border-emerald-100",
      update: "text-blue-600 bg-blue-50 border-blue-100",
      delete: "text-red-600 bg-red-50 border-red-100",
      login: "text-purple-600 bg-purple-50 border-purple-100",
      logout: "text-orange-600 bg-orange-50 border-orange-100",
      approve: "text-emerald-600 bg-emerald-50 border-emerald-100",
      reject: "text-red-600 bg-red-50 border-red-100",
      status_change: "text-amber-600 bg-amber-50 border-amber-100",
      default: "text-slate-600 bg-slate-50 border-slate-100",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Activity Logs</h1>
          <p className="text-text-secondary">
            Monitor system activity and admin actions
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary">Total Logs</p>
          <p className="text-2xl font-bold text-text-primary">{totalLogs}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Activity Logs
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchActivityLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-2">📝</span>
                      <p className="font-medium">No activity logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <motion.tr
                    key={log._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(log.action)}`}>
                          <span>{getActionIcon(log.action)}</span>
                          <span className="capitalize">{log.action}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary capitalize">
                        {log.resource}
                      </div>
                      {log.resourceId && (
                        <div className="text-xs text-text-secondary font-mono mt-1">
                          ID: {log.resourceId.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">
                        {log.user?.name || log.adminName || "System"}
                      </div>
                      {log.user?.email && (
                        <div className="text-sm text-text-secondary">
                          {log.user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-secondary text-sm max-w-xs truncate" title={log.details || log.description}>
                        {log.details || log.description || "No details"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-text-secondary text-sm">
                        {formatDate(log.createdAt || log.timestamp)}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
