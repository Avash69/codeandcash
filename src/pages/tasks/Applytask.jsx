import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import enhancedTaskAPI from "../../api/enhancedTaskAPI";

const Applytask = () => {
  // Get task ID from URL parameters (if available)

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const apply = async () => {
      setLoading(true);
      setError("");
      try {
        // Log the id for debugging
        console.log("Applying for task with id (should be MongoDB _id):", id);
        // Call backend to apply for the task (send empty message if none)
        const response = await enhancedTaskAPI.applyForTask(id, "");
        // The backend returns { success, message, data: { ...application } }
        if (
          (response.success || response.status === "success") &&
          response.data
        ) {
          setApplication(response.data);
          // Redirect to My Applied Tasks with refresh state after short delay
          setTimeout(() => {
            navigate("/my-tasks", {
              state: {
                refreshData: true,
                newApplication: {
                  taskTitle: response.data.taskId?.title,
                  title: response.data.taskId?.title,
                },
              },
            });
          }, 1200);
        } else {
          setError(response.message || "Failed to apply for task.");
        }
      } catch (err) {
        setError(err.message || "Failed to apply for task.");
      } finally {
        setLoading(false);
      }
    };
    if (id) apply();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-950">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-indigo-500/30 animate-spin border-t-indigo-500"></div>
          <div className="text-lg text-slate-200">
            Submitting your application...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-950">
        <div className="p-8 text-center rounded-lg shadow-lg bg-red-900/80">
          <div className="mb-2 text-2xl text-red-300">
            ❌ Application Failed
          </div>
          <div className="mb-4 text-slate-200">{error}</div>
          <Link to="/exploretask" className="text-cyan-400 hover:underline">
            Browse More Tasks
          </Link>
        </div>
      </div>
    );
  }

  // If application succeeded, show a quick success message (redirect happens automatically)
  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-950">
      <div className="p-8 text-center rounded-lg shadow-lg bg-indigo-900/80">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-800/50">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="mb-2 text-2xl font-bold text-slate-50">
          Application Submitted!
        </div>
        <div className="mb-2 text-slate-300">
          Redirecting to your applied tasks...
        </div>
        {application && (
          <div className="mt-2 text-sm text-slate-400">
            Task:{" "}
            <span className="font-semibold text-slate-200">
              {application.taskId?.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applytask;
