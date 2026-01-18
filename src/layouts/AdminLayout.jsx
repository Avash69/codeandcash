import { AnimatePresence, motion } from "framer-motion";
import { Activity, FileText, Home, Send, Users, LogOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../api/adminService.js";
import { getCurrentUser } from "../api/authService";

/**
 * Admin Layout Component
 * Refactored to Premium Light Theme
 */
export const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ref to prevent double check in StrictMode
  const checkedRef = useRef(false);

  const checkAdminAccess = useCallback(async () => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    try {
      const user = getCurrentUser();
      const token = localStorage.getItem("token");

      if (!user || !token) {
        navigate("/login");
        return;
      }

      if (user.email === "admin@codeandcash.com" && user.role !== "admin") {
        user.role = "admin";
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (user.role === "admin") {
        setIsAdmin(true);
        setCurrentUser(user);
        adminService.updateToken(token);

        try {
          await adminService.checkAccess();
        } catch (apiError) {
          console.warn("Admin API check failed:", apiError.message);
        }
      } else {
        setIsAdmin(false);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Admin access check error:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { path: "/admin/tasks", label: "Tasks", icon: <FileText className="w-5 h-5" /> },
    { path: "/admin/applications", label: "Applications", icon: <Send className="w-5 h-5" /> },
    { path: "/admin/activity-logs", label: "Activity Logs", icon: <Activity className="w-5 h-5" /> },
  ];

  // Loading state (Light Theme)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="p-8 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto border-4 rounded-full border-indigo-200 animate-spin border-t-indigo-600"></div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Initializing Admin Panel</h3>
          <p className="text-text-secondary mt-2">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Access denied state (Light Theme)
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="max-w-md p-8 bg-white border border-border shadow-xl rounded-2xl text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-text-primary">Access Denied</h1>
          <p className="mb-6 leading-relaxed text-text-secondary">
            You don't have admin privileges to access this area. Please contact your administrator.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Main admin layout (Premium Light Theme)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-border shadow-lg lg:relative lg:translate-x-0 lg:z-0 lg:shadow-none"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <div>
                <span className="block text-lg font-bold text-text-primary">Admin Panel</span>
                <span className="text-xs text-text-secondary">Codexa Control</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-text-secondary hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
                    }`}
                >
                  <div className={`mr-3 ${isActive ? "text-indigo-600" : "text-text-muted group-hover:text-text-primary"}`}>
                    {item.icon}
                  </div>
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-border bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-border rounded-xl shadow-sm">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {currentUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{currentUser?.name || "Admin User"}</p>
                <p className="text-xs text-text-secondary truncate">{currentUser?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 transition-colors rounded-xl hover:bg-red-50 group"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="px-6 py-4 bg-white border-b border-border shadow-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-text-secondary hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-text-primary">
              {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border rounded-lg hover:bg-slate-50 hover:text-text-primary transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Back to Site
            </Link>

            <div className="flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live System
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 scroll-smooth">
          <Outlet />

          <footer className="mt-12 py-6 border-t border-border/50 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted">
            <div>
              &copy; {new Date().getFullYear()} Codexa Admin Panel. All rights reserved.
            </div>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <span>v2.4.0</span>
              <span>Server Status: Good</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
