import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTaskById } from "../../api/taskService";

// Enhanced animation variants
const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Helper Components - Light Theme
const DifficultyBadge = ({ difficulty }) => {
  const getDifficultyStyle = (level) => {
    const styles = {
      Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Medium: "bg-amber-50 text-amber-700 border-amber-200",
      Hard: "bg-red-50 text-red-700 border-red-200",
    };
    const difficultyKey = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty?.slice(1).toLowerCase()) : "Easy";
    return styles[difficultyKey] || styles.Easy;
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyStyle(
        difficulty
      )}`}
    >
      {difficulty}
    </span>
  );
};

const UrgencyIndicator = ({ urgency }) => {
  const getUrgencyStyle = (level) => {
    const styles = {
      Low: "bg-blue-50 text-blue-700 border border-blue-100",
      Medium: "bg-orange-50 text-orange-700 border border-orange-100",
      High: "bg-red-50 text-red-700 border border-red-100",
    };
    return styles[level] || styles.Low;
  };

  return (
    <div
      className={`flex items-center px-3 py-1 rounded-full ${getUrgencyStyle(
        urgency
      )}`}
    >
      <div className="w-2 h-2 mr-2 bg-current rounded-full"></div>
      <span className="text-sm font-medium">{urgency} Priority</span>
    </div>
  );
};

const InfoCard = ({ icon, label, value, className = "" }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`flex items-center p-5 rounded-xl bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
  >
    <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-xl bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div>
      <p className="text-sm text-text-muted font-medium mb-0.5">{label}</p>
      <p className="text-base font-semibold text-text-primary">{value}</p>
    </div>
  </motion.div>
);

const SkillTag = ({ skill, index }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="px-4 py-2 text-sm font-medium transition-colors border rounded-full bg-slate-50 text-text-secondary border-slate-200 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm"
  >
    {skill}
  </motion.span>
);

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError("");

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(id)) {
        setError("Invalid task ID format. Please check the URL.");
        setLoading(false);
        return;
      }

      try {
        const result = await getTaskById(id);
        const taskObj = result?.task || result;

        if (!taskObj || !taskObj._id) {
          setError("Task not found or invalid task ID");
          return;
        }

        const isValidDate = (val) => val && !isNaN(Date.parse(val));
        const formattedTask = {
          ...taskObj,
          title: taskObj.title || "Untitled Task",
          company: taskObj.company || "Unknown Company",
          category: taskObj.category || "General",
          difficulty:
            taskObj.difficulty?.charAt(0).toUpperCase() +
            taskObj.difficulty?.slice(1) || "Easy",
          payout: typeof taskObj.payout === "number" ? taskObj.payout : 0,
          duration: taskObj.duration || 1,
          status: taskObj.status || "active",
          deadline: isValidDate(taskObj.deadline)
            ? format(new Date(taskObj.deadline), "PPP")
            : taskObj.deadline || "No deadline set",
          postedDate: isValidDate(taskObj.createdAt)
            ? format(new Date(taskObj.createdAt), "PPP")
            : taskObj.postedDate || taskObj.createdAt || "Date unknown",
          applicants: Array.isArray(taskObj.applicants)
            ? taskObj.applicants.length
            : 0,
          requiredSkills: Array.isArray(taskObj.skills) ? taskObj.skills : [],
          benefits: Array.isArray(taskObj.benefits)
            ? taskObj.benefits
            : [
              "Work with cutting-edge technology",
              "Flexible working hours",
              "Portfolio addition",
              "Professional development",
            ],
          requirements: Array.isArray(taskObj.requirements)
            ? taskObj.requirements
            : [],
          deliverables: Array.isArray(taskObj.deliverables)
            ? taskObj.deliverables
            : [
              "Complete source code",
              "Documentation",
              "Testing and quality assurance",
            ],
          location: taskObj.location || "Remote",
          overview: taskObj.description || "No description available.",
          tags: Array.isArray(taskObj.tags) ? taskObj.tags : [],
          estimatedTime: taskObj.duration
            ? `${taskObj.duration} days`
            : "Duration not specified",
          urgency: taskObj.urgency || "Medium",
          clientId: taskObj.clientId || null,
          assignedTo: taskObj.assignedTo || null,
          isActive: taskObj.isActive !== undefined ? taskObj.isActive : true,
          companyLogo:
            taskObj.companyLogo ||
            taskObj.company?.substring(0, 2).toUpperCase() ||
            "??",
        };

        setTask(formattedTask);
      } catch (error) {
        if (error.status === 400) {
          setError("Invalid task ID format.");
        } else if (error.status === 404) {
          setError("Task not found.");
        } else {
          setError(error.message || "Failed to load task details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 border-4 rounded-full border-slate-200 animate-spin border-t-indigo-600"></div>
          <p className="text-text-secondary font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          <motion.div
            {...ANIMATION_VARIANTS.scaleIn}
            className="bg-white p-10 rounded-2xl shadow-xl text-center border border-border"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">Task Not Found</h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {error || "The task you are looking for does not exist or has been removed."}
            </p>
            <Link to="/exploretask">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary text-white rounded-xl font-medium shadow-md hover:bg-primary-hover transition-colors"
              >
                Browse Tasks
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Background */}
      <div className="h-64 bg-slate-100 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-60"></div>
        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Navigation */}
        <motion.div {...ANIMATION_VARIANTS.fadeInLeft} className="mb-6">
          <Link
            to="/exploretask"
            className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-primary transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200/50"
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
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Explore
          </Link>
        </motion.div>

        {/* Task Header */}
        <motion.div
          {...ANIMATION_VARIANTS.fadeInUp}
          className="bg-white rounded-2xl shadow-lg border border-border p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {task.companyLogo}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-1">{task.title}</h1>
                  <div className="flex items-center text-text-secondary">
                    <span className="font-medium mr-2">{task.company}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-2"></span>
                    <span className="text-sm">{task.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <DifficultyBadge difficulty={task.difficulty} />
                <UrgencyIndicator urgency={task.urgency} />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-text-secondary border border-slate-200 capitalize">
                  {task.category}
                </span>
                {task.status === 'active' && <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Open</span>}
              </div>

              <h2 className="text-lg font-semibold text-text-primary mb-3">Overview</h2>
              <p className="text-text-secondary leading-relaxed text-lg">
                {task.overview}
              </p>
            </div>

            {/* Sidebar Card for Desktop / Bottom for Mobile */}
            <div className="lg:min-w-[300px]">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="mb-6">
                  <p className="text-sm text-text-muted mb-1 font-semibold uppercase tracking-wider">Total Payout</p>
                  <p className="text-4xl font-bold text-text-primary">${task.payout?.toLocaleString()}</p>
                </div>

                <Link to={`/applytask/${task._id || id}`} className="block w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-hover hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </Link>

                <p className="text-xs text-center text-text-muted mt-4">
                  Average response time: 2 days
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Details Grid */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-primary rounded-lg">📋</span> Task Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Posted Date"
                  value={task.postedDate}
                />
                <InfoCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Deadline"
                  value={task.deadline}
                />
                <InfoCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Estimated Time"
                  value={task.estimatedTime}
                />
                <InfoCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  label="Applicants"
                  value={`${task.applicants} people applied`}
                />
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.3 }}
              className="bg-white border border-border rounded-2xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">✅</span> Requirements
              </h3>
              <ul className="space-y-4">
                {task.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text-primary">{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Deliverables */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.4 }}
              className="bg-white border border-border rounded-2xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">📦</span> Deliverables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.deliverables.map((del, i) => (
                  <div key={i} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-text-primary font-medium">{del}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Skills */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-text-primary mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills.map((skill, i) => (
                  <SkillTag key={i} skill={skill} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Separator */}
            <div className="border-t border-slate-200"></div>

            {/* Benefits */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-text-primary mb-4">What You'll Gain</h3>
              <div className="space-y-3">
                {task.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <span className="text-lg">✨</span>
                    <span className="text-text-secondary text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-text-secondary bg-slate-100 px-2 py-1 rounded border border-slate-200">#{tag}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
