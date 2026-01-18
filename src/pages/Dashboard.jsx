import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/authService";
import enhancedTaskAPI from "../api/enhancedTaskAPI";
import { STORAGE_KEYS } from "../constants/appConstants";

// Profile Completion Reminder Component
const ProfileCompletionReminder = ({ onClose }) => {
  // Mock profile completion percentage
  const completionPercentage = 30;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
    >
      <div className="w-full max-w-4xl p-1 pointer-events-auto overflow-hidden rounded-2xl shadow-xl shadow-indigo-500/10 bg-surface border border-border">
        <div className="p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 space-x-4 sm:mb-0">
              <div className="relative p-2.5 bg-white rounded-xl shadow-sm border border-indigo-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="absolute w-3 h-3 bg-amber-400 border-2 border-white rounded-full -top-1 -right-1 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Complete Your Profile
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-text-secondary">
                    Add your details to get personalized tasks.
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center ml-12 space-x-3 sm:ml-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-lg transition-colors"

              >
                Later
              </button>
              <Link to="/profile">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-lg shadow-primary/25 hover:bg-primary-hover"
                >
                  Complete Now
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Dashboard = () => {
  // References for sections to track when they come into view
  const howItWorksRef = useRef(null);
  const featuredTasksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // State for profile completion reminder
  const [showProfileReminder, setShowProfileReminder] = useState(false);

  // State for tracking whether the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State for personalized recommendations
  const [personalizedTasks, setPersonalizedTasks] = useState([]);

  // State for featured tasks from API
  const [featuredTasks, setFeaturedTasks] = useState([]);
  const [isLoadingFeaturedTasks, setIsLoadingFeaturedTasks] = useState(false);
  const [featuredTasksError, setFeaturedTasksError] = useState(null);

  // State for user data
  const [user, setUser] = useState(null);

  // Check if we should show the profile reminder on component mount
  useEffect(() => {
    const shouldShowReminder =
      localStorage.getItem("showProfileReminder") === "true";

    if (shouldShowReminder) {
      setShowProfileReminder(true);
    }
  }, []);

  // Function to close the reminder and not show it again
  const handleCloseReminder = () => {
    setShowProfileReminder(false);
    localStorage.removeItem("showProfileReminder");
  };

  // Function to fetch featured tasks from API
  const fetchFeaturedTasks = useCallback(async () => {
    try {
      setIsLoadingFeaturedTasks(true);
      setFeaturedTasksError(null);

      // Set auth token if available
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        enhancedTaskAPI.setToken(token);
      }

      // Get tasks with limit for featured section
      const response = await enhancedTaskAPI.getTasks({
        limit: 3,
        status: "open", // Only show open tasks
        page: 1,
      });

      // Backend contract: tasks are always in response.data.tasks
      let tasks = [];
      if (response?.data?.tasks && Array.isArray(response.data.tasks)) {
        tasks = response.data.tasks;
      }

      // Take only first 3 tasks for featured section
      const limitedTasks = tasks.slice(0, 3);
      setFeaturedTasks(limitedTasks);

    } catch (error) {
      console.error("❌ Error fetching featured tasks:", error);
      setFeaturedTasksError(error.message || "Failed to load featured tasks");

      // Fallback to mock data if API fails
      const mockTasks = [
        {
          _id: "1",
          title: "Build a React Component Library",
          description:
            "Create reusable component library with full documentation...",
          category: "frontend",
          payout: 75,
          company: "TechCorp",
          difficulty: "medium",
          status: "open",
        },
        {
          _id: "2",
          title: "API Integration for Payment Gateway",
          description:
            "Implement secure payment processing using Stripe API...",
          category: "backend",
          payout: 90,
          company: "DataSys",
          difficulty: "hard",
          status: "open",
        },
        {
          _id: "3",
          title: "E-commerce Dashboard",
          description:
            "Build a responsive admin dashboard with Vue.js and Tailwind...",
          category: "fullstack",
          payout: 85,
          company: "WebSolutions",
          difficulty: "medium",
          status: "open",
        },
      ];
      setFeaturedTasks(mockTasks);
    } finally {
      setIsLoadingFeaturedTasks(false);
    }
  }, []);

  // Debug function to test featured tasks API directly
  const handleDebugFeaturedTasksAPI = useCallback(async () => {
    console.log("🐛 DEBUG FEATURED TASKS API CALL");
    try {
      const response = await enhancedTaskAPI.getTasks({
        limit: 3,
        status: "open",
        page: 1,
      });

      const debugInfo = {
        success: true,
        response: response,
        responseType: typeof response,
        keys: response ? Object.keys(response) : null,
        tasksCount: response?.data?.tasks?.length || 0,
        hasDataTasks: !!(
          response?.data?.tasks && Array.isArray(response.data.tasks)
        ),
      };

      console.log("Debug Response:", debugInfo);
      alert(
        `Featured Tasks API Response:\n${JSON.stringify(debugInfo, null, 2)}`
      );
    } catch (error) {
      const debugError = {
        success: false,
        message: error.message,
        status: error.status,
        response: error.response?.data,
      };

      console.error("Debug Error:", debugError);
      alert(
        `Featured Tasks API Error:\n${JSON.stringify(debugError, null, 2)}`
      );
    }
  }, [user]);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          setIsLoggedIn(true);

          // Set token for enhanced API
          enhancedTaskAPI.setToken(token);

          // Get current user
          const currentUser = getCurrentUser();
          setUser(currentUser);

          // Mock personalized tasks - in a real implementation, you would fetch these from an API
          const mockPersonalizedTasks = [
            {
              tag: "React + Tailwind",
              rate: "$95",
              title: "Dashboard UI Enhancement",
              difficulty: "Intermediate",
              matchPercentage: 98,
              description:
                "Improve an existing dashboard UI with modern components and animations...",
            },
            {
              tag: "JavaScript",
              rate: "$80",
              title: "Performance Optimization",
              difficulty: "Advanced",
              matchPercentage: 92,
              description:
                "Optimize load times and runtime performance for a JavaScript-heavy application...",
            },
            {
              tag: "React Native",
              rate: "$110",
              title: "Mobile App Features",
              difficulty: "Intermediate",
              matchPercentage: 85,
              description:
                "Add new features to an existing React Native application with clean architecture...",
            },
          ];

          setPersonalizedTasks(mockPersonalizedTasks);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }

      // Always fetch featured tasks (both logged in and not logged in users)
      await fetchFeaturedTasks();
    };

    checkAuthAndLoadData();
  }, [fetchFeaturedTasks]);

  // Check if sections are in view
  const howItWorksInView = useInView(howItWorksRef, {
    once: true,
    amount: 0.3,
  });
  const featuredTasksInView = useInView(featuredTasksRef, {
    once: true,
    amount: 0.3,
  });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.3,
  });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Profile Completion Reminder */}
      <AnimatePresence>
        {showProfileReminder && isLoggedIn && (
          <ProfileCompletionReminder onClose={handleCloseReminder} />
        )}
      </AnimatePresence>

      {/* Advanced Hero Section */}
      <div className="relative z-10 overflow-hidden pt-24 pb-24 bg-gradient-to-b from-white via-indigo-50/30 to-background">
        {/* Decorative elements - Softer & Cleaner */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[800px] h-[800px] bg-indigo-200/20 rounded-full -top-96 -left-40 blur-3xl opacity-50"></div>
          <div className="absolute w-[600px] h-[600px] bg-purple-200/20 rounded-full -bottom-40 -right-40 blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {isLoggedIn ? (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
              {/* Left side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-block mb-4"
                >
                  <span className="px-4 py-2 text-sm font-semibold text-primary rounded-full bg-indigo-50 border border-indigo-100">
                    ✨ Welcome Back!
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-6 text-5xl md:text-6xl font-bold leading-tight text-text-primary"
                >
                  Your Next <span className="text-primary">Opportunity</span> Awaits
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 text-xl text-text-secondary leading-relaxed"
                >
                  Discover curated coding tasks from leading companies, showcase your skills, and earn competitive rates. Level up your career today.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-3xl font-bold text-primary">1,250+</div>
                    <div className="text-sm text-text-muted">Active Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-3xl font-bold text-primary">$850K+</div>
                    <div className="text-sm text-text-muted">Paid Out</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-3xl font-bold text-primary">2,500+</div>
                    <div className="text-sm text-text-muted">Developers</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to="/exploretask">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.25)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-lg font-semibold bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all"
                    >
                      Explore Tasks →
                    </motion.button>
                  </Link>
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-lg font-semibold text-text-primary bg-white border border-border rounded-xl shadow-sm hover:bg-slate-50 transition-all"
                    >
                      Update Profile
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right side - Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative">
                  {/* Floating card 1 */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-0 -left-12 w-64 p-6 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <span className="text-2xl">💻</span>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold text-green-600 bg-green-50 rounded-full border border-green-100">In Progress</span>
                    </div>
                    <h4 className="font-semibold text-text-primary mb-2">React Dashboard UI</h4>
                    <p className="text-sm text-text-secondary mb-3">Build a responsive dashboard component library with Tailwind CSS.</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-primary font-bold">$150</span>
                      <span className="text-xs text-text-muted">Est. 5 hrs</span>
                    </div>
                  </motion.div>

                  {/* Floating card 2 */}
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-0 -right-12 w-64 p-6 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">Available</span>
                    </div>
                    <h4 className="font-semibold text-text-primary mb-2">API Integration</h4>
                    <p className="text-sm text-text-secondary mb-3">Integrate Stripe payment gateway with Node.js backend.</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-primary font-bold">$200</span>
                      <span className="text-xs text-text-muted">Est. 8 hrs</span>
                    </div>
                  </motion.div>

                  {/* Center visual element */}
                  <div className="w-80 h-80 mx-auto bg-gradient-to-br from-indigo-50 to-white rounded-full flex items-center justify-center shadow-inner relative z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-indigo-200"
                    ></motion.div>
                    <div className="text-center p-8 bg-white rounded-full shadow-lg shadow-indigo-100">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-2"
                      >
                        🚀
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
              {/* Left side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-block mb-4"
                >
                  <span className="px-4 py-2 text-sm font-semibold text-primary rounded-full bg-indigo-50 border border-indigo-100">
                    🎯 For Developers & Teams
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-6 text-5xl md:text-6xl font-bold leading-tight text-text-primary"
                >
                  Build Together, <span className="text-primary">Earn Smarter</span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 text-xl text-text-secondary leading-relaxed"
                >
                  Connect with talented developers and businesses. Solve real-world coding tasks, build your portfolio, and earn competitive income all in one platform.
                </motion.p>

                {/* Key features */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4 mb-8"
                >
                  {[
                    { icon: "✓", text: "Flexible tasks matching your skills" },
                    { icon: "💰", text: "Competitive payment rates & quick payouts" },
                    { icon: "🏆", text: "Build real-world portfolio projects" },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                        {feature.icon === "✓" ? "✓" : ""}
                        {feature.icon !== "✓" && feature.icon}
                      </div>

                      <span className="text-text-secondary">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.25)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all"
                    >
                      Join Now - It's Free →
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right side - Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative h-96">
                  {/* Abstract Tech Visual */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white rounded-[2rem] border border-slate-100 transform rotate-3 shadow-2xl"></div>

                  {/* Code snippet cards */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-10 left-0 w-72 p-6 bg-white rounded-xl border border-slate-100 shadow-xl z-20"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <code className="text-sm font-mono block p-3 bg-slate-50 rounded-lg text-slate-700">
                      <div><span className="text-purple-600">const</span> task = <span className="text-purple-600">await</span> solve()</div>
                      <div className="mt-1"><span className="text-purple-600">return</span> <span className="text-green-600">"$$$"</span></div>
                    </code>
                  </motion.div>

                  {/* Stats cards */}
                  <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-10 right-0 w-64 p-5 bg-white rounded-xl border border-slate-100 shadow-xl z-20"
                  >
                    <div className="text-sm font-semibold text-text-secondary mb-3">Platform Stats</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">5K+</div>
                        <div className="text-xs text-text-muted">Tasks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">4.8★</div>
                        <div className="text-xs text-text-muted">Rating</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Tasks Section - Only shown to logged in users */}
      {isLoggedIn && (
        <div className="relative z-20 py-16 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-8 border border-border rounded-2xl shadow-sm bg-background"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    Recommended For You
                  </h2>
                  <p className="text-text-secondary mt-1">
                    Tasks matching your skills and preferences
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/my-tasks">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      My Applied Tasks
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover transition-colors"
                  >
                    View All Matches
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {personalizedTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 text-xs font-medium text-primary rounded-full bg-indigo-50 border border-indigo-100">
                          {task.tag}
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {task.rate}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="mb-2 text-lg font-semibold text-text-primary">
                          {task.title}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-text-secondary">
                            {task.difficulty}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-1 text-xs font-medium text-text-muted">
                              Match:
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              {task.matchPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{ width: `${task.matchPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="mb-6 text-sm text-text-secondary line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex justify-end mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.05, x: 3 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          View Details
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* How it Works Section - Only shown to non-logged in users */}
      {!isLoggedIn && (
        <div
          ref={howItWorksRef}
          className="relative z-10 py-20 bg-background"
          id="how-it-works"
        >
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.h2
              {...fadeInUp}
              animate={howItWorksInView ? "animate" : "initial"}
              className="mb-12 text-3xl font-bold text-center text-text-primary"
            >
              How Codexa Works
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate={howItWorksInView ? "animate" : "initial"}
              className="grid grid-cols-1 gap-8 md:grid-cols-3"
            >
              {[
                {
                  title: "Create an Account",
                  description:
                    "Sign up as a developer or business user to get started using coding journey",
                  icon: "✨"
                },
                {
                  title: "Find or Post Tasks",
                  description:
                    "Browse or create coding tasks with clear requirements",
                  icon: "🔍"
                },
                {
                  title: "Complete & Get Paid",
                  description:
                    "Submit your solution, get approved and receive payment directly to your account",
                  icon: "💸"
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-8 transition-shadow duration-300 border rounded-2xl shadow-sm bg-white border-slate-100 hover:shadow-lg"
                >
                  <div className="w-12 h-12 mb-6 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                  <div className="mb-4 text-xl font-semibold text-text-primary">
                    {step.title}
                  </div>
                  <p className="text-text-secondary leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Featured Tasks Section */}
      <div
        ref={featuredTasksRef}
        className="relative z-10 py-20 bg-white"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={featuredTasksInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                Featured Tasks
              </h2>
              <p className="mt-2 text-text-secondary">
                Discover the latest opportunities from top companies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchFeaturedTasks}
                disabled={isLoadingFeaturedTasks}
                className="items-center hidden px-4 py-2 font-medium text-text-primary transition-all duration-200 rounded-lg bg-slate-100 hover:bg-slate-200 sm:inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${isLoadingFeaturedTasks ? "animate-spin" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              <Link
                to="/exploretask"
                className="text-primary hover:text-primary-hover font-medium"
              >
                View All Tasks →
              </Link>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoadingFeaturedTasks && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-12 h-12 mx-auto border-4 rounded-full border-indigo-100 animate-spin border-t-primary"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {featuredTasksError && !isLoadingFeaturedTasks && (
            <div className="py-20 text-center bg-red-50 rounded-2xl">
              <div className="mb-4 text-red-500 font-medium">
                ⚠️ Failed to load featured tasks
              </div>
              <p className="mb-6 text-sm text-red-400">
                {featuredTasksError}
              </p>
              <button
                onClick={fetchFeaturedTasks}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Featured Tasks Grid */}
          {!isLoadingFeaturedTasks && !featuredTasksError && (
            <>
              {featuredTasks.length > 0 ? (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate={featuredTasksInView ? "animate" : "initial"}
                  className="grid grid-cols-1 gap-8 md:grid-cols-3"
                >
                  {featuredTasks.map((task, index) => (
                    <motion.div
                      key={task._id || task.id || index}
                      variants={fadeInUp}
                      className="group overflow-hidden transition-all duration-300 border rounded-2xl shadow-sm bg-white border-slate-100 hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 text-sm font-medium text-primary rounded-full bg-indigo-50">
                            {task.category || "General"}
                          </span>
                          <span className="text-lg font-bold text-slate-900">
                            ${task.payout || task.budget || 0}
                          </span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        <p className="mb-6 text-text-secondary line-clamp-3 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-muted mb-1">Company</span>
                            <span className="text-sm font-medium text-text-primary">
                              {task.company || task.clientId?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-text-muted mb-1">Difficulty</span>
                            <span className="text-sm font-medium text-text-primary capitalize px-2 py-0.5 bg-slate-100 rounded">
                              {task.difficulty || "Medium"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4">
                          <Link
                            to={`/task-details/${task._id || task.id}`}
                            className="block w-full text-center py-2.5 px-4 bg-white border border-border text-text-primary font-medium rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm text-3xl">
                    📂
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-text-primary">
                    No Featured Tasks Available
                  </h3>
                  <p className="mb-6 text-text-secondary max-w-md mx-auto">
                    Check back later for new featured opportunities, or explore
                    all available tasks.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={fetchFeaturedTasks}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20"
                    >
                      Refresh Tasks
                    </button>
                    <Link
                      to="/exploretask"
                      className="px-6 py-2.5 text-sm font-medium text-text-primary bg-white border border-border rounded-xl hover:bg-slate-50"
                    >
                      Browse All Tasks
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Testimonials Section */}
      <div
        ref={testimonialsRef}
        className="relative z-10 py-20 bg-background"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            animate={testimonialsInView ? "animate" : "initial"}
            className="mb-12 text-3xl font-bold text-center text-text-primary"
          >
            What Our Users Say
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={testimonialsInView ? "animate" : "initial"}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <motion.div
              variants={fadeInUp}
              className="p-8 transition-all duration-300 border rounded-2xl shadow-sm border-slate-100 bg-white hover:shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="mb-6 text-text-primary text-lg leading-relaxed italic">
                "I found my ideal tasks quickly. The platform's easy to use and
                payments are always on time."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">DJ</div>
                <div>
                  <div className="font-bold text-text-primary">
                    David Johnson
                  </div>
                  <div className="text-sm text-text-secondary">
                    Frontend Developer
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="p-8 transition-all duration-300 border rounded-2xl shadow-sm border-slate-100 bg-white hover:shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="mb-6 text-text-primary text-lg leading-relaxed italic">
                "As a tech startup, finding reliable developers was a challenge.
                codexa made it simple and efficient."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">MC</div>
                <div>
                  <div className="font-bold text-text-primary">
                    Michael Chen
                  </div>
                  <div className="text-sm text-text-secondary">
                    Tech Startup Founder
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        ref={ctaRef}
        className="relative z-10 py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-20 px-4 mx-auto text-center max-w-4xl sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-4xl font-bold text-white tracking-tight"
          >
            Ready to Start Your Coding Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 text-xl text-indigo-100/90 leading-relaxed max-w-2xl mx-auto"
          >
            Join thousands of developers earning income, building portfolios, and growing their careers on Codexa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              to="/signup"
              className="px-10 py-4 text-lg font-bold transition-all duration-300 bg-white rounded-xl shadow-2xl text-primary hover:bg-slate-50 hover:shadow-white/20"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
