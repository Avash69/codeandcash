import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  formatDate,
  getDeadlineStatus,
  isTaskLate,
} from "../../utils/taskUtils.jsx";
import { TaskStatusBadge } from "./TaskStatusBadge.jsx";

/**
 * Enhanced Task Card component with comprehensive task information
 * @param {Object} task - Task object containing all task details
 * @param {number} index - Index for stagger animation
 * @param {Function} onApprove - Function to handle task approval
 * @param {Function} onDelete - Function to handle task deletion
 * @param {Function} onStatusChange - Function to handle status changes
 */
export const TaskCard = ({
  task,
  index,
  onApprove,
  onDelete,
  onStatusChange,
}) => {
  const deadlineStatus = getDeadlineStatus(task.deadline);
  const isLate =
    task.submittedAt && isTaskLate(task.submittedAt, task.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <div className="p-6 transition-all duration-200 border shadow-sm rounded-xl bg-surface border-border hover:border-primary/50 hover:shadow-md">
        {/* Header with title and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link to={`/task-details/${task._id || task.id}`}>
              <h3 className="text-lg font-bold transition-colors text-text-primary group-hover:text-primary line-clamp-1">
                {task.title}
              </h3>
            </Link>
            <p className="mt-1 leading-relaxed text-text-secondary line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="flex flex-col items-end ml-4 space-y-2">
            <TaskStatusBadge status={task.status} />
            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                ${task.price}
              </p>
            </div>
          </div>
        </div>

        {/* Developer and submission info */}
        {task.developerName && (
          <div className="p-3 mb-3 rounded-lg bg-surfaceHighlight border border-border/50">
            <p className="text-sm font-medium text-text-primary">
              👨‍💻 Assigned to: {task.developerName}
            </p>
            {task.approvedAt && (
              <p className="text-xs text-text-muted">
                Approved: {formatDate(task.approvedAt)}
              </p>
            )}
          </div>
        )}

        {/* Submission status for submitted tasks */}
        {task.status === "submitted" && task.submittedAt && (
          <div
            className={`mb-3 p-3 rounded-lg border ${isLate
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-green-50 border-green-100 text-green-700"
              }`}
          >
            <p className="text-sm font-medium">
              {isLate ? "⚠️ Late Submission" : "✅ On Time"}
            </p>
            <p className="text-xs opacity-80">
              Submitted: {formatDate(task.submittedAt)}
            </p>
          </div>
        )}

        {/* Deadline warning */}
        {task.deadline && task.status !== "completed" && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deadlineStatus.color === 'text-red-500' ? 'bg-red-50 text-red-700' :
                deadlineStatus.color === 'text-yellow-500' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-surfaceHighlight text-text-secondary'
              }`}>
              📅 {deadlineStatus.text}
            </span>
          </div>
        )}

        {/* Task details */}
        <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
          <div className="flex items-center space-x-4">
            <div className="flex items-center" title="Posted Date">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(task.postedDate)}</span>
            </div>
            <div className="flex items-center" title="Applicants">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span>{task.applicants || "0"} applicants</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Link
            to={`/task-details/${task._id || task.id}`}
            className="flex-1"
          >
            <button className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-primary border-primary/20 hover:bg-primary/5">
              View Details
            </button>
          </Link>

          {onDelete && (
            <button
              onClick={() => onDelete(task._id || task.id)}
              className="px-3 py-2 text-text-muted transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
              title="Delete Task"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
