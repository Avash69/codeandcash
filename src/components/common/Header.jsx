import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header on login, signup, and admin pages
  const hideOnPaths = ["/login", "/signup", "/Login", "/Signup"];
  const shouldHideHeader =
    hideOnPaths.includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  // Check if user is logged in and if they're admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Check admin status if logged in
    if (token) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [location.pathname]);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (token && user) {
        // First check if the user has admin role in their profile
        if (user.role === "admin") {
          setIsAdmin(true);
          return;
        }

        // As a fallback, try the API check (but this might fail if endpoint doesn't exist)
        try {
          adminService.setToken(token);
          await adminService.checkAdminAccess();
          setIsAdmin(true);
        } catch (error) {
          console.warn("Admin API check failed:", error);
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowLogoutToast(true); // Show toast on logout
    // Stay on dashboard instead of redirecting to login
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  // Toast timeout effect
  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => {
        setShowLogoutToast(false);
      }, 1500); // Hide toast after 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/tasks/explore", label: "Explore Tasks" },
    { to: "/my-tasks", label: "My Tasks" },
    { to: "/help", label: "Help" },
    { to: "/#about", label: "About Us" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return shouldHideHeader ? null : (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b shadow-sm bg-background/80 border-border backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      {/* Logout Toast */}
      <AnimatePresence>
        {showLogoutToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed z-[9999] top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-surface border border-border text-text-primary font-medium shadow-2xl flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>You have logged out</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold tracking-tight text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400 group-hover:to-indigo-300 transition-all"
              >
                Codexa
              </motion.span>
            </Link>
          </div>

          {/* Navigation Links - Middle */}
          <div className="items-center justify-center flex-1 hidden mx-8 md:flex">
            <nav className="flex space-x-1 p-1 rounded-full bg-surface/50 border border-border/50 backdrop-blur-sm">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full text-text-secondary hover:text-text-primary hover:bg-surfaceHighlight"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* Auth Buttons - Right Side */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="items-center hidden space-x-4 md:flex"
          >
            {/* Profile Icon */}
            {isLoggedIn && (
              <Link
                to="/profile"
                className="p-2 transition-colors duration-200 rounded-full text-text-secondary hover:text-primary hover:bg-primary/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}

            {/* Buttons */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium transition-all border rounded-xl text-text-muted border-border hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium transition-colors text-text-secondary hover:text-text-primary"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-medium transition-all shadow-lg rounded-xl bg-primary text-white shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg md:hidden text-text-secondary hover:text-text-primary hover:bg-surface"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t bg-background/95 backdrop-blur-xl border-border md:hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                >
                  <Link
                    to={link.to}
                    className="block px-4 py-3 text-base font-medium transition-colors rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-4 mt-4 border-t border-border">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 font-medium text-red-400 transition-colors border rounded-xl border-border hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      className="block w-full py-3 font-medium text-center transition-colors rounded-xl text-text-secondary hover:bg-surface"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full py-3 font-medium text-center text-white shadow-lg rounded-xl bg-primary shadow-primary/20"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
