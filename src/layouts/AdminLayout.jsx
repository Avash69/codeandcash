// import { AnimatePresence, motion } from "framer-motion";
// import { Activity, FileText, Home, Send, Users } from "lucide-react";
// import { useCallback, useEffect, useState } from "react";
// import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
// import { adminService } from "../api/adminService.js";
// import { getCurrentUser } from "../api/authService";

// /**
//  * Admin Layout Component
//  *
//  * Provides the admin-specific layout with sidebar navigation,
//  * admin authentication checks, and responsive design
//  */
// export const AdminLayout = () => {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const checkAdminAccess = useCallback(async () => {
//     try {
//       console.log("=== ADMIN ACCESS CHECK START ===");

//       const user = getCurrentUser();
//       const token = localStorage.getItem("token");

//       // Enhanced debugging
//       console.log("User object:", user);
//       console.log("User role:", user?.role);
//       console.log("Token exists:", !!token);

//       if (!user || !token) {
//         console.log("❌ No user or token found, redirecting to login");
//         navigate("/login");
//         return;
//       }

//       // Special handling for admin@codeandcash.com email
//       if (user.email === "admin@codeandcash.com" && user.role !== "admin") {
//         console.log("⚠️ Admin email without admin role - fixing");
//         user.role = "admin";
//         localStorage.setItem("user", JSON.stringify(user));
//         console.log("Fixed user object:", user);
//       }

//       // Check if user has admin role from the user object
//       console.log("Checking user role:", user.role);
//       console.log("Is admin?", user.role === "admin");

//       if (user.role === "admin") {
//         console.log("✅ User has admin role, granting access");
//         setIsAdmin(true);
//         setCurrentUser(user);
//         adminService.updateToken(token);

//         // Try the API check, but don't fail if backend doesn't have the endpoint
//         try {
//           await adminService.checkAccess();
//           console.log("✅ Admin API check passed");
//         } catch (apiError) {
//           console.warn(
//             "⚠️ Admin API check failed (this is OK if backend doesn't have this endpoint):",
//             apiError.message
//           );
//           // Continue anyway since we verified via user.role
//         }
//       } else {
//         console.error(
//           "❌ Access denied. User role:",
//           user.role,
//           "Expected: admin"
//         );
//         // Show a helpful error message instead of redirecting
//         setIsAdmin(false);
//         setCurrentUser(user);
//       }

//       console.log("=== ADMIN ACCESS CHECK END ===");
//     } catch (error) {
//       console.error("❌ Admin access check error:", error);
//       setIsAdmin(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   // Check admin access on mount
//   useEffect(() => {
//     checkAdminAccess();
//   }, [checkAdminAccess]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const navItems = [
//     {
//       path: "/admin",
//       label: "Dashboard",
//       icon: <Home className="w-5 h-5" />,
//     },
//     {
//       path: "/admin/users",
//       label: "Users",
//       icon: <Users className="w-5 h-5" />,
//     },
//     {
//       path: "/admin/tasks",
//       label: "Tasks",
//       icon: <FileText className="w-5 h-5" />,
//     },
//     {
//       path: "/admin/applications",
//       label: "Applications",
//       icon: <Send className="w-5 h-5" />,
//     },
//     {
//       path: "/admin/activity-logs",
//       label: "Activity Logs",
//       icon: <Activity className="w-5 h-5" />,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
//         <div className="p-8 text-center">
//           <div className="relative mb-6">
//             <div className="w-16 h-16 mx-auto border-4 rounded-full border-indigo-500/30 animate-spin">
//               <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full border-t-indigo-500 animate-spin"></div>
//             </div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
//               Initializing Admin Panel
//             </h3>
//             <p className="text-gray-400">Checking admin access...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!isAdmin) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
//         <div className="max-w-md p-8 border shadow-2xl bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
//           <div className="text-center">
//             <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 shadow-lg bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-red-500/25">
//               <svg
//                 className="w-8 h-8 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
//                 />
//               </svg>
//             </div>
//             <h1 className="mb-4 text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text">
//               Access Denied
//             </h1>
//             <p className="mb-6 leading-relaxed text-gray-400">
//               You don't have admin privileges to access this area. Please
//               contact your administrator if you believe this is an error.
//             </p>
//             <Link
//               to="/dashboard"
//               className="inline-flex items-center px-6 py-3 text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/40"
//             >
//               <svg
//                 className="w-4 h-4 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//               Return to Dashboard
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
//       {/* Mobile sidebar backdrop */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setSidebarOpen(false)}
//             className="fixed inset-0 z-20 bg-black bg-opacity-60 backdrop-blur-sm lg:hidden"
//           />
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.div
//         initial={false}
//         animate={{
//           x: sidebarOpen ? 0 : -320,
//         }}
//         className="fixed inset-y-0 left-0 z-30 border-r shadow-2xl w-72 bg-gradient-to-b from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-white/10 lg:relative lg:translate-x-0 lg:z-0"
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="flex items-center justify-between p-6 border-b border-white/10">
//             <Link to="/admin" className="flex items-center group">
//               <div className="flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl group-hover:shadow-indigo-500/25">
//                 <svg
//                   className="w-6 h-6 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <span className="text-xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
//                   Admin Panel
//                 </span>
//                 <div className="text-xs font-medium text-indigo-400">
//                   Control Center
//                 </div>
//               </div>
//             </Link>
//             <button
//               onClick={() => setSidebarOpen(false)}
//               className="p-2 text-gray-400 transition-all duration-200 rounded-xl lg:hidden hover:text-white hover:bg-white/10"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-6 space-y-3">
//             {navItems.map((item, index) => (
//               <motion.div
//                 key={item.path}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <Link
//                   to={item.path}
//                   className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${
//                     location.pathname === item.path
//                       ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
//                       : "text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/5"
//                   }`}
//                 >
//                   <div
//                     className={`p-2 rounded-lg transition-all duration-300 ${
//                       location.pathname === item.path
//                         ? "bg-white/20"
//                         : "group-hover:bg-white/10"
//                     }`}
//                   >
//                     {item.icon}
//                   </div>
//                   <span className="ml-3 font-medium">{item.label}</span>
//                   {location.pathname === item.path && (
//                     <motion.div
//                       layoutId="activeIndicator"
//                       className="w-2 h-2 ml-auto bg-white rounded-full"
//                     />
//                   )}
//                 </Link>
//               </motion.div>
//             ))}
//           </nav>

//           {/* User info and logout */}
//           <div className="p-6 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
//             <div className="flex items-center p-3 mb-4 bg-white/5 rounded-xl backdrop-blur-sm">
//               <div className="relative">
//                 <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
//                   <span className="text-sm font-bold text-white">
//                     {currentUser?.name?.[0] || "A"}
//                   </span>
//                 </div>
//                 <div className="absolute w-4 h-4 bg-green-500 border-2 rounded-full -bottom-1 -right-1 border-slate-800"></div>
//               </div>
//               <div className="flex-1 ml-3">
//                 <p className="text-sm font-semibold text-white truncate">
//                   {currentUser?.name || "Admin"}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate">
//                   {currentUser?.email || "admin@example.com"}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full px-4 py-3 text-sm text-gray-300 transition-all duration-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 group"
//             >
//               <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                   />
//                 </svg>
//               </div>
//               <span className="ml-3 font-medium">Logout</span>
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       {/* Main content */}
//       <div className="flex flex-col flex-1 lg:ml-0">
//         {/* Top bar */}
//         <header className="px-6 py-4 border-b shadow-lg bg-white/5 backdrop-blur-xl border-white/10">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="p-2.5 text-gray-400 rounded-xl lg:hidden hover:text-white hover:bg-white/10 transition-all duration-200"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//               </button>
//               <div className="ml-2">
//                 <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
//                   {navItems.find((item) => item.path === location.pathname)
//                     ?.label || "Admin"}
//                 </h1>
//                 <p className="text-sm text-gray-400 mt-0.5">
//                   Manage your platform efficiently
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="items-center hidden space-x-3 sm:flex">
//                 <div className="flex items-center px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
//                   <div className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></div>
//                   <span className="text-xs font-medium text-green-400">
//                     Live
//                   </span>
//                 </div>
//               </div>
//               <Link
//                 to="/dashboard"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 border bg-white/5 border-white/10 rounded-xl hover:bg-white/10 hover:text-white backdrop-blur-sm"
//               >
//                 <svg
//                   className="w-4 h-4 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                   />
//                 </svg>
//                 Back to Site
//               </Link>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-transparent via-slate-900/20 to-transparent">
//           <div className="mx-auto max-w-7xl">
//             <Outlet />
//           </div>
//         </main>

//         {/* Footer */}
//         <footer className="px-6 py-4 border-t bg-white/5 backdrop-blur-xl border-white/10">
//           <div className="flex items-center justify-between text-sm text-gray-400">
//             <div className="flex items-center space-x-4">
//               <span>© 2024 Code & Cash Admin</span>
//               <span className="hidden sm:inline">•</span>
//               <span className="hidden sm:inline">v2.1.0</span>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="hidden sm:inline">
//                 Last updated: {new Date().toLocaleTimeString()}
//               </span>
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span>System Healthy</span>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import { AnimatePresence, motion } from "framer-motion";
import { Activity, FileText, Home, Send, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../api/adminService.js";
import { getCurrentUser } from "../api/authService";

/**
 * Admin Layout Component
 *
 * Provides the admin-specific layout with sidebar navigation,
 * admin authentication checks, and responsive design
 */
export const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Ref to prevent double check in StrictMode
  const checkedRef = useRef(false);

  const checkAdminAccess = useCallback(async () => {
    if (checkedRef.current) return; // skip if already checked
    checkedRef.current = true;

    try {
      console.log("=== ADMIN ACCESS CHECK START ===");

      const user = getCurrentUser();
      const token = localStorage.getItem("token");

      console.log("User object:", user);
      console.log("User role:", user?.role);
      console.log("Token exists:", !!token);

      if (!user || !token) {
        console.log("❌ No user or token found, redirecting to login");
        navigate("/login");
        return;
      }

      if (user.email === "admin@codeandcash.com" && user.role !== "admin") {
        console.log("⚠️ Admin email without admin role - fixing");
        user.role = "admin";
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (user.role === "admin") {
        console.log("✅ User has admin role, granting access");
        setIsAdmin(true);
        setCurrentUser(user);
        adminService.updateToken(token);

        try {
          await adminService.checkAccess();
          console.log("✅ Admin API check passed");
        } catch (apiError) {
          console.warn("⚠️ Admin API check failed:", apiError.message);
        }
      } else {
        console.error("❌ Access denied. User role:", user.role);
        setIsAdmin(false);
        setCurrentUser(user);
      }

      console.log("=== ADMIN ACCESS CHECK END ===");
    } catch (error) {
      console.error("❌ Admin access check error:", error);
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
        <div className="p-8 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto border-4 rounded-full border-indigo-500/30 animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full border-t-indigo-500 animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Initializing Admin Panel
            </h3>
            <p className="text-gray-400">Checking admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
        <div className="max-w-md p-8 border shadow-2xl bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 shadow-lg bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-red-500/25">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text">
              Access Denied
            </h1>
            <p className="mb-6 leading-relaxed text-gray-400">
              You don't have admin privileges to access this area. Please contact your administrator.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main admin layout
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black bg-opacity-60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed inset-y-0 left-0 z-30 border-r shadow-2xl w-72 bg-gradient-to-b from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-white/10 lg:relative lg:translate-x-0 lg:z-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/admin" className="flex items-center group">
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl group-hover:shadow-indigo-500/25">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                  Admin Panel
                </span>
                <div className="text-xs font-medium text-indigo-400">
                  Control Center
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 transition-all duration-200 rounded-xl lg:hidden hover:text-white hover:bg-white/10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-3">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/5"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-white/20"
                        : "group-hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium">{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-2 h-2 ml-auto bg-white rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-6 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
            <div className="flex items-center p-3 mb-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <span className="text-sm font-bold text-white">
                    {currentUser?.name?.[0] || "A"}
                  </span>
                </div>
                <div className="absolute w-4 h-4 bg-green-500 border-2 rounded-full -bottom-1 -right-1 border-slate-800"></div>
              </div>
              <div className="flex-1 ml-3">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.email || "admin@example.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-300 transition-all duration-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 group"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <span className="ml-3 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-0">
        <header className="px-6 py-4 border-b shadow-lg bg-white/5 backdrop-blur-xl border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 text-gray-400 rounded-xl lg:hidden hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="ml-2">
                <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                  {navItems.find((item) => item.path === location.pathname)?.label || "Admin"}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Manage your platform efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="items-center hidden space-x-3 sm:flex">
                <div className="flex items-center px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-400">
                    Live
                  </span>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 border bg-white/5 border-white/10 rounded-xl hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-transparent via-slate-900/20 to-transparent">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t bg-white/5 backdrop-blur-xl border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>© 2025 Code & Cash Admin</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">v2.1.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Healthy</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
