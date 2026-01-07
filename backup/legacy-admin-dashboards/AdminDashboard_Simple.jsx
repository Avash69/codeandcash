import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../api/adminService";

/**
 * Admin Dashboard Component with live statistics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    recentUsers: 0,
    recentTasks: 0,
    totalApplications: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // The backend now returns the data in the format shown
      const response = await adminService.getDashboardStats();

      // Handle both direct data and nested data structure
      const data = response.data || response;
      setStats({
        totalUsers: data.totalUsers || 0,
        totalTasks: data.totalTasks || 0,
        activeTasks: data.activeTasks || 0,
        completedTasks: data.completedTasks || 0,
        recentUsers: data.recentUsers || 0,
        recentTasks: data.recentTasks || 0,
        totalApplications: data.totalApplications || 0,
        totalSubmissions: data.totalSubmissions || 0,
        pendingReviews: data.pendingReviews || 0,
        approvedSubmissions: data.approvedSubmissions || 0,
        rejectedSubmissions: data.rejectedSubmissions || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/25",
      link: "/admin/users",
      description: "Registered platform users",
      trending:
        stats.recentUsers > 0
          ? `+${stats.recentUsers} recent`
          : "No recent users",
      trendingColor: stats.recentUsers > 0 ? "positive" : "neutral",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: "📝",
      gradient: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/25",
      link: "/admin/tasks",
      description: `${stats.activeTasks} active, ${stats.completedTasks} completed`,
      trending:
        stats.recentTasks > 0
          ? `+${stats.recentTasks} recent`
          : "No recent tasks",
      trendingColor: stats.recentTasks > 0 ? "positive" : "neutral",
    },
    {
      title: "Submissions",
      value: stats.totalSubmissions,
      icon: "📊",
      gradient: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/25",
      link: "/admin/submissions",
      description: `${stats.approvedSubmissions} approved, ${stats.rejectedSubmissions} rejected`,
      trending: `${stats.pendingReviews} pending`,
      trendingColor: stats.pendingReviews > 0 ? "warning" : "positive",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: "📋",
      gradient: "from-orange-500 to-red-500",
      shadowColor: "shadow-orange-500/25",
      link: "/admin/applications",
      description: "Total task applications",
      trending:
        stats.totalApplications > stats.totalSubmissions
          ? `${stats.totalApplications - stats.totalSubmissions} in progress`
          : "All submitted",
      trendingColor: "neutral",
    },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="h-10 bg-gray-700 w-80 rounded-xl animate-pulse"></div>
            <div className="w-64 h-6 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-32 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-6 space-y-4 border bg-gray-800/50 border-gray-700/50 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-24 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
              </div>
              <div className="w-16 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="p-6 space-y-6 border bg-gray-800/50 border-gray-700/50 rounded-2xl"
            >
              <div className="w-40 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-32 h-5 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Enhanced Header with Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-lg text-gray-300 font-medium">
                    System Online
                  </span>
                  {stats.lastUpdated && (
                    <span className="text-sm text-gray-500 ml-4">
                      • Updated{" "}
                      {new Date(stats.lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-400 max-w-2xl"
            >
              Monitor, manage, and optimize your platform with real-time
              insights and powerful administrative tools.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDashboardStats}
              className="group relative overflow-hidden px-8 py-4 text-white font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center space-x-3">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh Data</span>
              </div>
            </motion.button>

            <div className="text-center">
              <p className="text-xs text-gray-500">Real-time updates</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-6 border shadow-xl bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500/50 backdrop-blur-sm rounded-2xl"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-300">
                  Dashboard Error
                </h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Statistics Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6 + index * 0.15,
              duration: 0.6,
              ease: "easeOut",
            }}
            whileHover={{ y: -12, scale: 1.03 }}
            className="group relative"
          >
            {/* Floating background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
            ></div>

            {/* Main card */}
            <div className="relative overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full blur-3xl`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tl ${card.gradient} rounded-full blur-2xl`}
                ></div>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <Link to={card.link} className="relative block">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-32">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <span className="text-2xl block">{card.icon}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                        card.trendingColor === "positive"
                          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          : card.trendingColor === "warning"
                          ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                      }`}
                    >
                      {card.trending}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-end space-x-2">
                    <p className="text-5xl font-black text-white group-hover:text-gray-100 transition-colors">
                      {card.value.toLocaleString()}
                    </p>
                  </div>

                  {/* Enhanced progress bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{
                          delay: 1.0 + index * 0.15,
                          duration: 2,
                          ease: "easeOut",
                        }}
                        className={`h-full bg-gradient-to-r ${card.gradient} rounded-full relative`}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 + index * 0.15 }}
                      className="absolute -top-8 right-0 text-xs text-gray-400 font-medium"
                    >
                      85% capacity
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced arrow indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <svg
                      className="w-4 h-4 text-white"
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
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="relative p-8 overflow-hidden border shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>

          <div className="relative space-y-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Manage Users",
                  icon: "👥",
                  link: "/admin/users",
                  color: "from-blue-500 to-blue-600",
                  description: "User management & permissions",
                },
                {
                  title: "Manage Tasks",
                  icon: "📝",
                  link: "/admin/tasks",
                  color: "from-green-500 to-green-600",
                  description: "Create & monitor tasks",
                },
                {
                  title: "Review Submissions",
                  icon: "📊",
                  link: "/admin/submissions",
                  color: "from-purple-500 to-purple-600",
                  description: "Approve or reject submissions",
                },
                {
                  title: "Platform Analytics",
                  icon: "📈",
                  link: "/admin/analytics",
                  color: "from-orange-500 to-red-500",
                  description: "Performance insights",
                },
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                >
                  <Link
                    to={action.link}
                    className="flex items-center p-4 space-x-4 transition-all duration-300 border group bg-gray-700/30 hover:bg-gray-700/50 border-gray-600/30 hover:border-gray-500/50 rounded-xl"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <span className="text-xl">{action.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-gray-100">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300">
                        {action.description}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 transition-colors group-hover:text-white"
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
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="relative p-8 overflow-hidden border shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>

          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Recent Activity
                </h2>
              </div>
              <button className="text-sm text-blue-400 transition-colors hover:text-blue-300">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  action: "New users registered",
                  user: `${stats.recentUsers} users today`,
                  time: "Latest activity",
                  type: "user",
                  color: "text-green-400",
                  count: stats.recentUsers,
                },
                {
                  action: "Tasks created",
                  user: `${stats.recentTasks} tasks added`,
                  time: "Recent",
                  type: "task",
                  color: "text-blue-400",
                  count: stats.recentTasks,
                },
                {
                  action: "Pending reviews",
                  user: `${stats.pendingReviews} submissions waiting`,
                  time: "Requires attention",
                  type: "review",
                  color: "text-yellow-400",
                  count: stats.pendingReviews,
                },
                {
                  action: "Active tasks",
                  user: `${stats.activeTasks} tasks in progress`,
                  time: "Current",
                  type: "active",
                  color: "text-purple-400",
                  count: stats.activeTasks,
                },
                {
                  action: "Completed tasks",
                  user: `${stats.completedTasks} tasks finished`,
                  time: "Total",
                  type: "completed",
                  color: "text-indigo-400",
                  count: stats.completedTasks,
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                  className="flex items-center p-4 space-x-4 transition-all duration-300 border bg-gray-700/30 hover:bg-gray-700/50 border-gray-600/30 rounded-xl group"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${activity.color.replace(
                      "text-",
                      "bg-"
                    )} group-hover:scale-150 transition-transform`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-gray-100">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-400 truncate group-hover:text-gray-300">
                      {activity.user}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${activity.color}`}>
                      {activity.count}
                    </span>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
