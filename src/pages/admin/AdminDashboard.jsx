import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../api/adminService";
import CompletedTasksTable from "../../components/admin/CompletedTasksTable";

/**
 * Admin Dashboard Component
 *
 * A clean, simplified dashboard that strictly follows the API endpoints
 * and provides essential admin functionality without redundant UI elements.
 */
const AdminDashboard = () => {
  // Dashboard state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    openTasks: 0,
    completedTasks: 0,
    totalApplications: 0,
    pendingReviews: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // API endpoint: GET /api/admin/stats
        const statsData = await adminService.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Dashboard stat cards
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      link: "/admin/users",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks || 0,
      icon: FileText,
      color: "bg-green-100 text-green-600",
      link: "/admin/tasks",
    },
    {
      title: "Pending Applications",
      value: stats.pendingReviews || 0,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
      link: "/admin/applications?status=pending",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks || 0,
      icon: UserCheck,
      color: "bg-indigo-100 text-indigo-600",
      link: "/admin/tasks?status=completed",
    },
  ];

  // Main admin actions
  const adminActions = [
    {
      title: "User Management",
      description: "View, edit, and manage user accounts",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      link: "/admin/users",
      endpoint: "/api/admin/users",
    },
    {
      title: "Task Management",
      description: "Create, edit, and delete tasks",
      icon: FileText,
      color: "bg-green-50 text-green-600",
      link: "/admin/tasks",
      endpoint: "/api/admin/tasks",
    },
    {
      title: "Application Review",
      description: "Review and process task applications",
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      link: "/admin/applications",
      endpoint: "/api/admin/applications",
    },
    {
      title: "Activity Logs",
      description: "Track system activity",
      icon: Activity,
      color: "bg-purple-50 text-purple-600",
      link: "/admin/activity-logs",
      endpoint: "/api/admin/activity-logs",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-t-primary border-primary/20 animate-spin"></div>
          <p className="text-text-secondary">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-lg p-6 mx-auto border rounded-xl bg-red-50 border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-red-700">Error</h2>
        </div>
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="mt-1 text-text-secondary">Platform overview and management</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={stat.link}
              className="block p-6 transition-all duration-200 border bg-white border-border rounded-xl hover:shadow-lg hover:border-indigo-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-text-primary">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Completed Tasks Table */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Completed Tasks
        </h2>
        <div className="bg-white border rounded-xl border-border shadow-sm overflow-hidden">
          <CompletedTasksTable />
        </div>
      </div>

      {/* Main Admin Functions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {adminActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link
                to={action.link}
                className="flex items-start p-6 transition-all duration-200 border bg-white border-border rounded-xl hover:shadow-lg hover:border-indigo-200 group"
              >
                <div className={`p-3 rounded-xl ${action.color} mr-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">{action.description}</p>
                  <div className="mt-2 text-xs text-text-muted font-mono bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                    API: {action.endpoint}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="p-6 border bg-white border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">System Status</h2>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 mr-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">API Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-text-secondary mb-1">Backend API</div>
            <div className="font-mono text-text-primary">http://localhost:5002</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-text-secondary mb-1">Last Updated</div>
            <div className="font-mono text-text-primary">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
