import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../api/adminService";

/**
 * Admin Dashboard Component
 *
 * Main dashboard showing admin statistics and quick actions
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    openTasks: 0,
    completedTasks: 0,
    recentUsers: 0,
    recentTasks: 0,
    totalApplications: 0,
    pendingReviews: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
  });
  const [analytics, setAnalytics] = useState({
    period: "30d",
    userRegistrations: [],
    taskCreations: [],
    applicationStats: [],
    categoryStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both stats and analytics
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics("30d"),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "bg-blue-500",
      link: "/admin/users",
      trend: `${stats.recentUsers} new this month`,
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: "📋",
      color: "bg-green-500",
      link: "/admin/tasks",
      trend: `${stats.recentTasks} new this month`,
    },
    {
      title: "Open Tasks",
      value: stats.openTasks,
      icon: "�",
      color: "bg-yellow-500",
      link: "/admin/tasks?status=open",
      trend: "Available for applications",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: "✅",
      color: "bg-indigo-500",
      link: "/admin/tasks?status=completed",
      trend: "Successfully finished",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: "�",
      color: "bg-purple-500",
      link: "/admin/applications",
      trend: "All submissions",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: "⏳",
      color: "bg-red-500",
      link: "/admin/applications?status=pending",
      trend: "Awaiting review",
    },
    {
      title: "Approved",
      value: stats.approvedSubmissions,
      icon: "✅",
      color: "bg-emerald-500",
      link: "/admin/applications?status=accepted",
      trend: "Accepted applications",
    },
    {
      title: "Rejected",
      value: stats.rejectedSubmissions,
      icon: "❌",
      color: "bg-orange-500",
      link: "/admin/applications?status=rejected",
      trend: "Declined applications",
    },
  ];

  const quickActions = [
    {
      title: "Create New Task",
      description: "Add a new task to the platform",
      icon: "➕",
      color: "bg-blue-600",
      link: "/admin/tasks/create",
    },
    {
      title: "Review Applications",
      description: "Review pending task applications",
      icon: "👁️",
      color: "bg-green-600",
      link: "/admin/applications?status=pending",
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: "👤",
      color: "bg-purple-600",
      link: "/admin/users",
    },
    {
      title: "Activity Logs",
      description: "View platform activity and admin logs",
      icon: "📈",
      color: "bg-orange-600",
      link: "/admin/activity-logs",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-900/20 border border-red-500 rounded-lg">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your platform</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last updated</p>
          <p className="text-white">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}
              >
                {card.icon}
              </div>
              {card.link && (
                <Link
                  to={card.link}
                  className="text-gray-400 hover:text-white transition-colors"
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
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-green-400">{card.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <Link
              to={action.link}
              className="block p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-700 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            {
              action: "New user registered",
              user: "john.doe@example.com",
              time: "2 minutes ago",
            },
            {
              action: "Task submitted",
              user: "jane.smith@example.com",
              time: "5 minutes ago",
            },
            {
              action: "Payment processed",
              user: "System",
              time: "10 minutes ago",
            },
            {
              action: "New task created",
              user: "admin@example.com",
              time: "15 minutes ago",
            },
            {
              action: "User profile updated",
              user: "bob.wilson@example.com",
              time: "20 minutes ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
            >
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.user}</p>
              </div>
              <p className="text-gray-500 text-sm">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Platform Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Application Success Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalApplications > 0
                          ? (stats.approvedSubmissions /
                              stats.totalApplications) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-white font-medium">
                  {stats.totalApplications > 0
                    ? Math.round(
                        (stats.approvedSubmissions / stats.totalApplications) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Task Completion Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalTasks > 0
                          ? (stats.completedTasks / stats.totalTasks) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-white font-medium">
                  {stats.totalTasks > 0
                    ? Math.round(
                        (stats.completedTasks / stats.totalTasks) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Open Task Ratio</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalTasks > 0
                          ? (stats.openTasks / stats.totalTasks) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-white font-medium">
                  {stats.totalTasks > 0
                    ? Math.round((stats.openTasks / stats.totalTasks) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Categories
          </h3>
          <div className="space-y-3">
            {(
              analytics.categoryStats || [
                { _id: "frontend", count: 45, avgPayout: 250 },
                { _id: "backend", count: 32, avgPayout: 300 },
                { _id: "fullstack", count: 28, avgPayout: 400 },
                { _id: "mobile", count: 18, avgPayout: 350 },
                { _id: "design", count: 12, avgPayout: 200 },
              ]
            )
              .slice(0, 5)
              .map((category, index) => {
                const maxCount = Math.max(
                  ...(analytics.categoryStats?.map((c) => c.count) || [50])
                );
                const percentage = (category.count / maxCount) * 100;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm capitalize">
                        {category._id}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm mr-2">
                        {category.count} tasks
                      </span>
                      <div className="w-16 bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
