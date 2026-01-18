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
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    border: 2px solid #6366f1;
    transition: all 0.2s ease;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    border: 2px solid #6366f1;
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
  { id: "all", label: "All Difficulties" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
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
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
  },
};

// Enhanced Price Range Slider with better UX - Light Theme
const PriceRangeSlider = ({ value, onChange }) => {
  return (
    <div className="mb-8">
      <h3 className="flex items-center mb-4 font-semibold text-text-primary">
        <span className="mr-2 text-primary">💰</span>
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
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-primary slider"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(value / 5000) * 100
                }%, #e2e8f0 ${(value / 5000) * 100}%, #e2e8f0 100%)`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="px-3 py-1 font-medium rounded-lg bg-slate-100 text-text-secondary">
            $0
          </span>
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 font-bold text-white shadow-md rounded-lg bg-primary"
          >
            ${value.toLocaleString()}
          </motion.span>
          <span className="px-3 py-1 font-medium rounded-lg bg-slate-100 text-text-secondary">
            $5,000
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sidebar Filter with better visual design - Light Theme
const SidebarFilter = ({
  title,
  options,
  selected,
  onChange,
  showIcons = false,
}) => {
  return (
    <div className="mb-8">
      <h3 className="flex items-center mb-4 font-semibold text-text-primary">
        {title === "Categories" && <span className="mr-2 text-primary">📂</span>}
        {title === "Difficulty" && <span className="mr-2 text-primary">⚡</span>}
        {title}
      </h3>
      <div className="space-y-1">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              {...ANIMATION_VARIANTS.scaleOnHover}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border ${isSelected
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                  : "text-text-secondary hover:bg-slate-50 border-transparent hover:border-slate-200"
                }`}
              onClick={() => onChange(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center font-medium">
                  {showIcons && option.icon && (
                    <span className="mr-3 opacity-80">{option.icon}</span>
                  )}
                  {option.label}
                </span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-indigo-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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

// Enhanced Task Card with better visual hierarchy and interactions - Light Theme
const TaskCard = ({ task, index }) => {
  // Helper function to get difficulty styling
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Medium: "bg-amber-50 text-amber-700 border-amber-200",
      Hard: "bg-red-50 text-red-700 border-red-200",
    };
    const difficultyKey = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) : "Easy";
    return styles[difficultyKey] || styles.Easy;
  };

  return (
    <motion.div
      {...ANIMATION_VARIANTS.fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative p-6 bg-white border border-border rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    >
      {/* Hover Highlight Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with company info */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
              {task.company ? task.company.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                {task.company}
              </h4>
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {task.duration} days
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyStyle(
              task.difficulty
            )}`}
          >
            {task.difficulty}
          </span>
        </div>

        {/* Task title and description */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
            {task.title}
          </h3>
          <p className="text-text-secondary leading-relaxed line-clamp-3 text-sm">
            {task.description}
          </p>
        </div>

        {/* Task details footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Payout</span>
            <span className="text-lg font-bold text-text-primary">
              ${task.payout.toLocaleString()}
            </span>
          </div>

          <Link to={`/task-details/${task._id || task.id}`} className="block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 font-medium text-white transition-all rounded-xl shadow-md bg-primary hover:bg-primary-hover hover:shadow-lg"
            >
              <span>Details</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.button>
          </Link>
        </div>
      </div>
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

        // Get tasks directly from the service
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

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    if (!task) return false;

    const matchesCategory =
      selectedCategory === "all" || (task.category && task.category.toLowerCase() === selectedCategory);
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

    return (
      matchesCategory && matchesDifficulty && matchesSearch && matchesPrice
    );
  });

  // Loading state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-2 py-20 text-center"
    >
      <div className="mb-6">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 text-4xl">
          🔍
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-primary">
          No tasks found
        </h3>
        <p className="max-w-md mx-auto text-text-secondary mb-8">
          We couldn't find any tasks matching your criteria. Try adjusting your filters or search terms.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedCategory("all");
            setSelectedDifficulty("all");
            setSearchQuery("");
            setMaxPrice(5000);
          }}
          className="px-6 py-2.5 font-medium text-white transition-colors rounded-xl bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg"
        >
          Clear All Filters
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Enhanced Header - Light Theme */}
        <motion.div
          {...ANIMATION_VARIANTS.fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-8 mb-12 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold text-text-primary tracking-tight lg:text-5xl">
              Explore <span className="text-primary">Opportunities</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Discover projects that match your skills. Filter by category, difficulty, or price to find your next challenge.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div
            {...ANIMATION_VARIANTS.fadeInRight}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full lg:w-96"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
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
              placeholder="Search tasks, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-12 transition-all duration-200 border rounded-2xl border-slate-200 bg-white text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-text-primary"
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
          {/* Enhanced Sidebar - Light Theme */}
          <motion.div
            {...ANIMATION_VARIANTS.fadeInLeft}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="sticky p-6 bg-white border border-border shadow-sm rounded-2xl top-24">
              <SidebarFilter
                title="Categories"
                options={FILTER_CATEGORIES}
                selected={selectedCategory}
                onChange={setSelectedCategory}
                showIcons={true}
              />
              <div className="my-6 border-t border-slate-100"></div>
              <SidebarFilter
                title="Difficulty"
                options={DIFFICULTIES}
                selected={selectedDifficulty}
                onChange={setSelectedDifficulty}
              />
              <div className="my-6 border-t border-slate-100"></div>
              <PriceRangeSlider value={maxPrice} onChange={setMaxPrice} />
            </div>
          </motion.div>

          {/* Enhanced Task Grid */}
          <div className="lg:col-span-3">
            {/* Results count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-text-secondary font-medium">
                Showing <span className="text-text-primary font-bold">{filteredTasks.length}</span> results
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-16 h-16 mb-4 border-4 rounded-full border-indigo-100 animate-spin border-t-indigo-600"></div>
                  <p className="text-text-secondary font-medium">Finding the best tasks for you...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center"
                >
                  <div className="mb-4 text-red-500 text-5xl">⚠️</div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h3>
                  <p className="text-text-secondary mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 text-white transition-colors bg-primary rounded-xl hover:bg-primary-hover shadow-md"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${selectedCategory}-${selectedDifficulty}-${searchQuery}-${maxPrice}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
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
