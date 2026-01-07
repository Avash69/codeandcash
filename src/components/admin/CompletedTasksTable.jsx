import { useEffect, useState } from "react";
import { adminService } from "../../api/adminService";

const CompletedTasksTable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getCompletedTasks();
        setTasks(res.data || res.tasks || res.applications || []);
      } catch (err) {
        setError(err.message || "Failed to fetch completed tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedTasks();
  }, []);

  if (loading) return <div>Loading completed tasks...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!tasks.length)
    return <div className="text-gray-400">No completed tasks found.</div>;

  return (
    <table className="w-full text-left border border-white/10 rounded-xl bg-white/5">
      <thead>
        <tr>
          <th className="p-3 text-sm font-medium text-gray-300">Task</th>
          <th className="p-3 text-sm font-medium text-gray-300">User</th>
          <th className="p-3 text-sm font-medium text-gray-300">Files</th>
          <th className="p-3 text-sm font-medium text-gray-300">Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((app) => (
          <tr
            key={app._id}
            className="border-t border-white/10 hover:bg-white/10"
          >
            <td className="p-3 text-white">{app.taskId?.title || "-"}</td>
            <td className="p-3 text-white">{app.userId?.name || "-"}</td>
            <td className="p-3">
              {app.submissions && app.submissions.length > 0 ? (
                app.submissions.map((file, idx) => (
                  <a
                    key={idx}
                    href={`/api/applications/${app._id}/submissions/${file._id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-400 hover:underline"
                  >
                    {file.originalName || file.filename || "File"}
                  </a>
                ))
              ) : (
                <span className="text-gray-400">No files</span>
              )}
            </td>
            <td className="p-3 text-white">{app.status || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CompletedTasksTable;
