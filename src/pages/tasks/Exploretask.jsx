import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../../api/taskService";

// Add custom styles for better UX
const customStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    border: 2px solid white;
    transition: all 0.2s ease;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .backdrop-blur {
    backdrop-filter: blur(10px);
  }
`;

// Inject styles into the document
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

// Configuration constants for better maintainability
const FILTER_CATEGORIES = [
  { id: "all", label: "All Tasks", icon: "🎯" },
  { id: "frontend", label: "Frontend", icon: "🎨" },
  { id: "backend", label: "Backend", icon: "⚙️" },
  { id: "fullstack", label: "Full Stack", icon: "🔄" },
  { id: "mobile", label: "Mobile", icon: "📱" },
];

const DIFFICULTIES = [
  { id: "all", label: "All Difficulties", color: "text-gray-400" },
  { id: "easy", label: "Easy", color: "text-green-500" },
  { id: "medium", label: "Medium", color: "text-yellow-500" },
  { id: "hard", label: "Hard", color: "text-red-500" },
];

// Animation variants for consistent motion design
const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleOnHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
};

// Enhanced Price Range Slider with better UX
const PriceRangeSlider = ({ value, onChange }) => {
  return (
    <div className="mb-8">
      <h3 className="flex items-center mb-4 font-medium text-text-primary">
        <span className="mr-2">💰</span>
        Price Range
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="5000"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-navy-light accent-indigo slider"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                (value / 5000) * 100
              }%, #1e293b ${(value / 5000) * 100}%, #1e293b 100%)`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="px-2 py-1 rounded bg-navy-light text-text-secondary">
            $0
          </span>
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-indigo to-purple-600"
          >
            ${value.toLocaleString()}
          </motion.span>
          <span className="px-2 py-1 rounded bg-navy-light text-text-secondary">
            $5,000
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sidebar Filter with better visual design
const SidebarFilter = ({
  title,
  options,
  selected,
  onChange,
  showIcons = false,
}) => {
  return (
    <div className="mb-8">
      <h3 className="flex items-center mb-4 font-medium text-text-primary">
        {title === "Categories" && <span className="mr-2">📂</span>}
        {title === "Difficulty" && <span className="mr-2">⚡</span>}
        {title}
      </h3>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              {...ANIMATION_VARIANTS.scaleOnHover}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border ${
                isSelected
                  ? "bg-gradient-to-r from-indigo to-purple-600 text-white border-indigo shadow-lg shadow-indigo/25"
                  : "text-text-secondary hover:bg-navy-light border-transparent hover:border-border hover:shadow-md"
              }`}
              onClick={() => onChange(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {showIcons && option.icon && (
                    <span className="mr-2 text-lg">{option.icon}</span>
                  )}
                  {option.label}
                </span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Task Card with better visual hierarchy and interactions
const TaskCard = ({ task, index }) => {
  // Helper function to get difficulty styling
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      Easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Hard: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[difficulty] || styles.Easy;
  };

  return (
    <motion.div
      {...ANIMATION_VARIANTS.fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="p-6 transition-all duration-300 border shadow-lg group rounded-xl bg-gradient-to-br from-navy-light to-navy border-border hover:shadow-2xl hover:shadow-indigo/10 hover:border-indigo/30"
    >
      {/* Header with company info */}
      <div className="flex items-center mb-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-gradient-to-r from-indigo to-purple-600"
        >
          <span className="text-sm font-bold text-white">
            {task.company[0]}
          </span>
        </motion.div>
        <div className="flex-1 ml-3">
          <span className="font-semibold transition-colors text-text-primary group-hover:text-indigo">
            {task.company}
          </span>
        </div>
        <motion.span
          whileHover={{ scale: 1.1 }}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyStyle(
            task.difficulty
          )}`}
        >
          {task.difficulty}
        </motion.span>
      </div>

      {/* Task title and description */}
      <h3 className="mb-3 text-xl font-bold transition-colors text-text-primary group-hover:text-indigo line-clamp-2">
        {task.title}
      </h3>
      <p className="mb-6 leading-relaxed text-text-secondary line-clamp-3">
        {task.description}
      </p>

      {/* Task details */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
              ${task.payout.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-text-secondary">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">{task.duration} days</span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-sm capitalize">{task.category}</span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <Link to={`/task-details/${task._id || task.id}`} className="block">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-indigo to-purple-600 hover:shadow-xl hover:shadow-indigo/25 focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2 focus:ring-offset-navy"
        >
          <span className="flex items-center justify-center">
            View Details
            <svg
              className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </motion.button>
      </Link>
    </motion.div>
  );
};

const Exploretask = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from backend on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get tasks directly from the service (no fallback logic needed)
        const fetchedTasks = await getTasks();

        console.log("📋 Fetched tasks from service:", fetchedTasks);

        // Service always returns an array, so we can use it directly
        setTasks(fetchedTasks);
      } catch (err) {
        console.error("❌ Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter logic with better performance
  const filteredTasks = tasks.filter((task) => {
    if (!task) return false;

    console.log("🔍 Filtering task:", task);

    const matchesCategory =
      selectedCategory === "all" || task.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      (task.difficulty && task.difficulty.toLowerCase() === selectedDifficulty);
    const matchesSearch =
      !searchQuery ||
      (task.title &&
        task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.company &&
        task.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = !task.payout || task.payout <= maxPrice;

    console.log("Filter results:", {
      matchesCategory,
      matchesDifficulty,
      matchesSearch,
      matchesPrice,
    });

    return (
      matchesCategory && matchesDifficulty && matchesSearch && matchesPrice
    );
  });

  // Loading state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-2 py-16 text-center"
    >
      <div className="mb-6">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo/20 to-purple-600/20">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-text-primary">
          No tasks found
        </h3>
        <p className="max-w-md mx-auto text-text-secondary">
          Try adjusting your filters or search terms to find more tasks that
          match your criteria.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setSelectedCategory("all");
          setSelectedDifficulty("all");
          setSearchQuery("");
          setMaxPrice(5000);
        }}
        className="px-6 py-2 text-white transition-colors rounded-lg bg-indigo hover:bg-indigo-hover"
      >
        Clear Filters
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          {...ANIMATION_VARIANTS.fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-6 mb-8 lg:flex-row lg:items-center"
        >
          <div>
            <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo to-purple-600 bg-clip-text">
              Explore Tasks
            </h1>
            <p className="text-lg text-text-secondary">
              Discover amazing opportunities and grow your skills
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div
            {...ANIMATION_VARIANTS.fadeInRight}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:w-80"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-4 transition-all duration-200 border rounded-xl border-border bg-navy-light/50 backdrop-blur text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent placeholder:text-text-secondary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-indigo">
              {filteredTasks.length}
            </span>{" "}
            of <span className="font-semibold">{tasks.length}</span> tasks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Enhanced Sidebar */}
          <motion.div
            {...ANIMATION_VARIANTS.fadeInLeft}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="sticky p-6 border shadow-xl top-8 rounded-xl bg-navy-light/50 backdrop-blur border-border">
              <SidebarFilter
                title="Categories"
                options={FILTER_CATEGORIES}
                selected={selectedCategory}
                onChange={setSelectedCategory}
                showIcons={true}
              />
              <SidebarFilter
                title="Difficulty"
                options={DIFFICULTIES}
                selected={selectedDifficulty}
                onChange={setSelectedDifficulty}
              />
              <PriceRangeSlider value={maxPrice} onChange={setMaxPrice} />

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                    setSearchQuery("");
                    setMaxPrice(5000);
                  }}
                  className="w-full px-4 py-2 text-sm transition-colors border rounded-lg border-border text-text-secondary hover:text-text-primary hover:border-indigo"
                >
                  Clear All Filters
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Task Grid */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-indigo-500/30 animate-spin border-t-indigo-500"></div>
                    <p className="text-slate-400">Loading available tasks...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center"
                >
                  <div className="mb-4 text-red-400">❌ {error}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${selectedCategory}-${selectedDifficulty}-${searchQuery}-${maxPrice}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-6 xl:grid-cols-2"
                >
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, index) => (
                      <TaskCard
                        key={task._id || task.id}
                        task={task}
                        index={index}
                      />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exploretask;
