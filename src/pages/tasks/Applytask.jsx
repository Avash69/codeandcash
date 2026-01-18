import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import enhancedTaskAPI from "../../api/enhancedTaskAPI";

const Applytask = () => {
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
        // Call backend to apply for the task (send empty message if none)
        const response = await enhancedTaskAPI.applyForTask(id, "");

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
          }, 1500);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 border-4 rounded-full border-slate-200 animate-spin border-t-indigo-600"></div>
          <h2 className="text-xl font-semibold text-text-primary">Submitting Application</h2>
          <p className="text-text-secondary mt-2">Please wait while we process your request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 text-center bg-white border border-red-100 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-text-primary">Application Failed</h2>
          <p className="mb-6 text-text-secondary leading-relaxed">{error}</p>
          <Link
            to="/exploretask"
            className="inline-flex items-center justify-center px-6 py-3 font-medium text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-md hover:shadow-lg"
          >
            Browse More Tasks
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 text-center bg-white border border-border rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full text-emerald-500 border border-emerald-100">
          <svg
            className="w-10 h-10"
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
        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Application Submitted!
        </h2>
        <p className="mb-6 text-text-secondary">
          Redirecting to your dashboard...
        </p>

        {application && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Applied For</p>
            <p className="font-medium text-text-primary">
              {application.taskId?.title || "Task Application"}
            </p>
          </div>
        )}

        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Applytask;
