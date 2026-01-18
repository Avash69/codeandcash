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

  if (loading) return <div className="p-4 text-text-secondary">Loading completed tasks...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!tasks.length)
    return <div className="p-4 text-text-secondary">No completed tasks found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Task</th>
            <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">User</th>
            <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Files</th>
            <th className="p-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((app) => (
            <tr
              key={app._id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="p-4 text-text-primary font-medium">{app.taskId?.title || "-"}</td>
              <td className="p-4 text-text-secondary">{app.userId?.name || "-"}</td>
              <td className="p-4">
                {app.submissions && app.submissions.length > 0 ? (
                  app.submissions.map((file, idx) => (
                    <a
                      key={idx}
                      href={`/api/applications/${app._id}/submissions/${file._id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary-hover hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.originalName || file.filename || "File"}
                    </a>
                  ))
                ) : (
                  <span className="text-text-muted text-sm italic">No files</span>
                )}
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${app.status === 'completed' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                  {app.status || "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedTasksTable;
