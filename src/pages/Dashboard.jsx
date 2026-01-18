import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/authService";
import enhancedTaskAPI from "../api/enhancedTaskAPI";
import AnimatedCubes from "../components/AnimatedCubes";
import { STORAGE_KEYS } from "../constants/appConstants";

// Profile Completion Reminder Component
const ProfileCompletionReminder = ({ onClose }) => {
  // Mock profile completion percentage - in a real implementation, you would
  // calculate this based on user data from an API or local storage
  const completionPercentage = 30;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
    >
      <div className="w-full max-w-4xl p-4 mx-4 mt-4 overflow-hidden rounded-lg shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 space-x-4 sm:mb-0">
            <div className="relative p-2 bg-white rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-indigo-600"
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
              <div className="absolute w-4 h-4 bg-yellow-400 border-2 border-indigo-600 rounded-full -top-1 -right-1 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Complete Your Profile
              </h3>
              <div className="space-y-1">
                <p className="text-indigo-100">
                  Add your details to get personalized tasks and increase your
                  chances of being selected!
                </p>
                <div className="w-full bg-indigo-800/50 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-indigo-200">
                  {completionPercentage}% Complete
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center ml-10 space-x-3 sm:ml-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 font-medium text-white rounded-md bg-white/20 hover:bg-white/30"
              onClick={onClose}
            >
              Later
            </motion.button>
            <Link to="/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 font-medium text-indigo-700 bg-white rounded-md hover:bg-indigo-50"
              >
                Complete Now
              </motion.button>
            </Link>
            <button
              onClick={onClose}
              className="p-1 text-white rounded-full hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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

      console.log("🔄 Fetching featured tasks from API...");

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

      console.log("✅ Featured tasks response:", response);

      // Backend contract: tasks are always in response.data.tasks
      let tasks = [];
      if (response?.data?.tasks && Array.isArray(response.data.tasks)) {
        tasks = response.data.tasks;
        console.log("✅ Tasks loaded from response.data.tasks:", tasks.length);
      } else {
        console.warn(
          "⚠️ Backend response does not contain data.tasks array:",
          response
        );
      }

      // Take only first 3 tasks for featured section
      const limitedTasks = tasks.slice(0, 3);
      setFeaturedTasks(limitedTasks);

      console.log("✅ Featured tasks loaded:", limitedTasks.length);
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
    console.log("User:", user);
    console.log("Token:", localStorage.getItem(STORAGE_KEYS.TOKEN));

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
    <div className="relative min-h-screen overflow-hidden bg-indigo-950">
      {/* Animated Cubes Background with optimized performance */}
      <AnimatedCubes count={25} performance="low" />

      {/* Profile Completion Reminder */}
      <AnimatePresence>
        {showProfileReminder && isLoggedIn && (
          <ProfileCompletionReminder onClose={handleCloseReminder} />
        )}
      </AnimatePresence>

      {/* Advanced Hero Section */}
      <div className="relative z-10 overflow-hidden pt-20 pb-24 bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-850">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full -top-40 -left-40 blur-3xl"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full -bottom-40 -right-40 blur-3xl"></div>
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
                  <span className="px-4 py-2 text-sm font-semibold text-indigo-300 rounded-full bg-indigo-900/50 border border-indigo-700">
                    ✨ Welcome Back!
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-6 text-5xl md:text-6xl font-bold leading-tight text-slate-50"
                >
                  Your Next <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Opportunity</span> Awaits
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 text-xl text-slate-300 leading-relaxed"
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">1,250+</div>
                    <div className="text-sm text-slate-400">Active Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">$850K+</div>
                    <div className="text-sm text-slate-400">Paid Out</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">2,500+</div>
                    <div className="text-sm text-slate-400">Developers</div>
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
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg text-white hover:from-indigo-600 hover:to-indigo-700 transition-all"
                    >
                      Explore Tasks →
                    </motion.button>
                  </Link>
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-lg font-semibold text-indigo-300 border-2 border-indigo-500 rounded-lg hover:bg-indigo-900/30 transition-all"
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
                    className="absolute top-0 -left-12 w-64 p-6 bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-xl border border-indigo-700 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        💻
                      </div>
                      <span className="px-3 py-1 text-xs font-bold text-green-400 bg-green-900/30 rounded-full">In Progress</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">React Dashboard UI</h4>
                    <p className="text-sm text-slate-400 mb-3">Build a responsive dashboard component library with Tailwind CSS.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">$150</span>
                      <span className="text-xs text-slate-400">Est. 5 hrs</span>
                    </div>
                  </motion.div>

                  {/* Floating card 2 */}
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-0 -right-12 w-64 p-6 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-xl border border-purple-700 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        ⚡
                      </div>
                      <span className="px-3 py-1 text-xs font-bold text-yellow-400 bg-yellow-900/30 rounded-full">Available</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">API Integration</h4>
                    <p className="text-sm text-slate-400 mb-3">Integrate Stripe payment gateway with Node.js backend.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">$200</span>
                      <span className="text-xs text-slate-400">Est. 8 hrs</span>
                    </div>
                  </motion.div>

                  {/* Center visual element */}
                  <div className="w-80 h-80 mx-auto">
                    <div className="relative w-full h-full">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400"
                      ></motion.div>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-2 border-transparent border-t-cyan-400 border-l-indigo-400"
                      ></motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl mb-2"
                          >
                            🚀
                          </motion.div>
                          <p className="text-slate-300 font-semibold">Start Earning Now</p>
                        </div>
                      </div>
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
                  <span className="px-4 py-2 text-sm font-semibold text-indigo-300 rounded-full bg-indigo-900/50 border border-indigo-700">
                    🎯 For Developers & Teams
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-6 text-5xl md:text-6xl font-bold leading-tight text-slate-50"
                >
                  Build Together, <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Earn Smarter</span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 text-xl text-slate-300 leading-relaxed"
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
                      <span className="text-2xl text-cyan-400">{feature.icon}</span>
                      <span className="text-slate-300">{feature.text}</span>
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
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg shadow-xl text-white hover:from-cyan-600 hover:to-indigo-700 transition-all"
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
                  {/* Code snippet cards */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-0 left-0 w-72 p-5 bg-slate-900/80 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <code className="text-sm text-cyan-400">
                      <div>const task = await solve()</div>
                      <div className="text-yellow-400">return <span className="text-green-400">"$$$"</span></div>
                    </code>
                  </motion.div>

                  {/* Stats cards */}
                  <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-0 right-0 w-72 p-5 bg-gradient-to-br from-indigo-800/80 to-purple-800/80 rounded-xl border border-indigo-600 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="text-sm font-semibold text-slate-300 mb-3">Platform Stats</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-cyan-400">5K+</div>
                        <div className="text-xs text-slate-400">Tasks Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-cyan-400">4.8★</div>
                        <div className="text-xs text-slate-400">Avg Rating</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Center hero graphic */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="w-48 h-48"
                    >
                      <div className="w-full h-full rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400 border-b-cyan-400 shadow-2xl shadow-indigo-500/50"></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Tasks Section - Only shown to logged in users */}
      {isLoggedIn && (
        <div className="relative z-20 py-8 bg-gradient-to-b from-indigo-950 to-indigo-900">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 border border-indigo-700 rounded-lg shadow-lg bg-indigo-900/60 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Recommended For You
                  </h2>
                  <p className="text-indigo-300">
                    Tasks matching your skills and preferences
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/my-tasks">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-purple-600/60 hover:bg-purple-600"
                    >
                      My Applied Tasks
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-indigo-600/60 hover:bg-indigo-600"
                  >
                    View All Matches
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {personalizedTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="overflow-hidden transition-all duration-300 border border-indigo-600 rounded-lg shadow-lg bg-gradient-to-br from-indigo-800 to-indigo-900 hover:shadow-xl hover:shadow-indigo-900/40"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 text-xs font-medium text-indigo-200 rounded-full bg-indigo-700/60">
                          {task.tag}
                        </span>
                        <span className="text-lg font-bold text-yellow-400">
                          {task.rate}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="mb-1 text-lg font-semibold text-white">
                          {task.title}
                        </h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-indigo-300">
                            {task.difficulty}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-1 text-xs font-medium text-indigo-300">
                              Match:
                            </span>
                            <span className="text-sm font-bold text-green-400">
                              {task.matchPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-indigo-800 rounded-full">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                            style={{ width: `${task.matchPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="mb-4 text-sm text-indigo-200">
                        {task.description}
                      </p>

                      <div className="flex justify-end mt-2">
                        <motion.button
                          whileHover={{ scale: 1.05, x: 3 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300"
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
          className="relative z-10 py-16 bg-indigo-900"
          id="how-it-works"
        >
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.h2
              {...fadeInUp}
              animate={howItWorksInView ? "animate" : "initial"}
              className="mb-12 text-3xl font-bold text-center text-slate-50"
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
                },
                {
                  title: "Find or Post Tasks",
                  description:
                    "Browse or create coding tasks with clear requirements",
                },
                {
                  title: "Complete & Get Paid",
                  description:
                    "Submit your solution, get approved and receive payment directly to your account",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 transition-shadow duration-300 border rounded-lg shadow-md bg-indigo-800/70 backdrop-blur-sm border-slate-600 hover:shadow-xl hover:shadow-indigo-900/20"
                >
                  <div className="mb-4 text-xl font-semibold text-indigo-400">
                    {step.title}
                  </div>
                  <p className="text-slate-300">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Featured Tasks Section */}
      <div
        ref={featuredTasksRef}
        className="relative z-10 py-16 bg-gradient-to-b from-indigo-900 to-indigo-800"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={featuredTasksInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-50">
                Featured Tasks
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Discover the latest opportunities from top companies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchFeaturedTasks}
                disabled={isLoadingFeaturedTasks}
                className="items-center hidden px-3 py-2 font-medium text-white transition-all duration-200 rounded-lg shadow-lg sm:inline-flex bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${
                    isLoadingFeaturedTasks ? "animate-spin" : ""
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
              <button
                onClick={handleDebugFeaturedTasksAPI}
                className="items-center hidden px-3 py-2 font-medium text-white transition-all duration-200 bg-yellow-600 rounded-lg shadow-lg sm:inline-flex hover:bg-yellow-500"
              >
                🐛 Debug API
              </button>
              <Link
                to="/exploretask"
                className="text-indigo-400 hover:text-indigo-300"
              >
                View All Tasks
              </Link>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoadingFeaturedTasks && (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 mx-auto border-4 rounded-full border-indigo-500/30 animate-spin border-t-indigo-500"></div>
                <div
                  className="absolute w-8 h-8 mx-auto transform -translate-x-1/2 border-4 rounded-full top-2 left-1/2 border-purple-500/30 animate-spin border-t-purple-500"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {featuredTasksError && !isLoadingFeaturedTasks && (
            <div className="py-12 text-center">
              <div className="mb-4 text-red-400">
                ⚠️ Failed to load featured tasks
              </div>
              <p className="mb-4 text-sm text-slate-400">
                {featuredTasksError}
              </p>
              <button
                onClick={fetchFeaturedTasks}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
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
                      className="overflow-hidden transition-shadow duration-300 border rounded-lg shadow-md bg-indigo-900/70 backdrop-blur-sm border-slate-600 hover:shadow-xl hover:shadow-indigo-900/30"
                      whileHover={{ y: -5 }}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 text-sm text-indigo-400 rounded-full bg-indigo-600/30">
                            {task.category || "General"}
                          </span>
                          <span className="text-yellow-500">
                            ${task.payout || task.budget || 0}
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-50">
                          {task.title}
                        </h3>
                        <p className="mb-4 text-slate-300 line-clamp-3">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-slate-400">
                            {task.company ||
                              task.clientId?.name ||
                              "Unknown Company"}
                          </span>
                          <span className="text-sm text-slate-400 capitalize">
                            {task.difficulty || "Medium"}
                          </span>
                        </div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="inline-block"
                        >
                          <Link
                            to={`/task-details/${task._id || task.id}`}
                            className="flex items-center text-cyan-500 hover:text-cyan-400"
                          >
                            View Task <span className="ml-1">→</span>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-12 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20">
                    <svg
                      className="w-8 h-8 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-50">
                    No Featured Tasks Available
                  </h3>
                  <p className="mb-4 text-slate-400">
                    Check back later for new featured opportunities, or explore
                    all available tasks.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={fetchFeaturedTasks}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
                    >
                      Refresh Tasks
                    </button>
                    <Link
                      to="/exploretask"
                      className="px-4 py-2 text-sm font-medium text-indigo-300 border border-indigo-500 rounded-md hover:bg-indigo-800/30"
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
        className="relative z-10 py-16 bg-gradient-to-b from-indigo-800 to-indigo-900"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            animate={testimonialsInView ? "animate" : "initial"}
            className="mb-12 text-3xl font-bold text-center text-slate-50"
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
              className="p-6 transition-all duration-300 border rounded-lg shadow-lg border-slate-600 bg-indigo-800/50 backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-900/30"
            >
              <p className="mb-4 text-slate-300">
                "I found my ideal tasks quickly. The platform's easy to use and
                payments are always on time."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-semibold text-indigo-400">
                    David Johnson
                  </div>
                  <div className="text-sm text-slate-400">
                    Frontend Developer
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="p-6 transition-all duration-300 border rounded-lg shadow-lg border-slate-600 bg-indigo-800/50 backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-900/30"
            >
              <p className="mb-4 text-slate-300">
                "As a tech startup, finding reliable developers was a challenge.
                codexa made it simple and efficient."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-semibold text-indigo-400">
                    Michael Chen
                  </div>
                  <div className="text-sm text-slate-400">
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
        className="relative z-10 py-16 bg-gradient-to-t from-indigo-950 to-indigo-900"
      >
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-3xl font-bold text-slate-50"
          >
            Ready to Start Your Coding Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-slate-300"
          >
            Join thousands of developers earning income on codexa
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/signup"
              className="px-8 py-3 text-lg font-medium transition-all duration-300 bg-yellow-500 rounded-md shadow-lg text-indigo-950 hover:bg-yellow-400 shadow-yellow-500/20"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
