import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Pause,
  Play,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

/**
 * Enhanced Status Badge Component with icons and modern styling
 */
export const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    const configs = {
      // User status styles
      active: {
        icon: CheckCircle,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Active",
      },
      inactive: {
        icon: XCircle,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Inactive",
      },
      suspended: {
        icon: Pause,
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Suspended",
      },

      // Task status styles
      open: {
        icon: Play,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Open",
      },
      in_progress: {
        icon: Clock,
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "In Progress",
      },
      closed: {
        icon: XCircle,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Closed",
      },
      draft: {
        icon: FileText,
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        label: "Draft",
      },

      // Application/Submission status styles
      pending: {
        icon: Clock,
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Pending",
      },
      accepted: {
        icon: CheckCircle,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Accepted",
      },
      rejected: {
        icon: XCircle,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Rejected",
      },
      completed: {
        icon: ShieldCheck,
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Completed",
      },
      in_review: {
        icon: Eye,
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "In Review",
      },

      // Default
      default: {
        icon: AlertCircle,
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        label: "Unknown",
      },
    };

    return configs[status?.toLowerCase()] || configs.default;
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * Enhanced Difficulty Badge Component
 */
export const DifficultyBadge = ({ difficulty }) => {
  const getDifficultyConfig = () => {
    const configs = {
      easy: {
        icon: CheckCircle,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Easy",
      },
      medium: {
        icon: AlertCircle,
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Medium",
      },
      hard: {
        icon: AlertTriangle,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Hard",
      },
      expert: {
        icon: Zap,
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Expert",
      },
    };

    return configs[difficulty?.toLowerCase()] || configs.medium;
  };

  const config = getDifficultyConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * Enhanced Priority Badge Component
 */
export const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = () => {
    const configs = {
      low: {
        icon: CheckCircle,
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Low",
      },
      medium: {
        icon: AlertCircle,
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Medium",
      },
      high: {
        icon: AlertTriangle,
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        label: "High",
      },
      urgent: {
        icon: Zap,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Urgent",
      },
    };

    return configs[priority?.toLowerCase()] || configs.medium;
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * Category Badge Component
 */
export const CategoryBadge = ({ category }) => {
  const getCategoryConfig = () => {
    const configs = {
      frontend: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Frontend",
      },
      backend: {
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Backend",
      },
      fullstack: {
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Full Stack",
      },
      mobile: {
        className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        label: "Mobile",
      },
      design: {
        className: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        label: "Design",
      },
      devops: {
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        label: "DevOps",
      },
      default: {
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        label: "Other",
      },
    };

    return configs[category?.toLowerCase()] || configs.default;
  };

  const config = getCategoryConfig();

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${config.className}`}
    >
      {config.label}
    </span>
  );
};
