/**
 * Reusable TaskStatusBadge component for displaying task status
 * @param {string} status - The status to display
 */
export const TaskStatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const styles = {
      open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      submitted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status.toLowerCase()] || styles.open;
  };

  const getStatusText = (status) => {
    const statusMap = {
      "in-progress": "In Progress",
      // Keep other statuses as-is
    };
    return (
      statusMap[status.toLowerCase()] ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
};
