import { motion } from "framer-motion";
import { useState } from "react";
import { adminService } from "../../api/adminService";

/**
 * Task Creation Form Component
 *
 * Modal form for creating new tasks (admin only)
 */
export const TaskCreationForm = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "medium",
    price: "",
    deadline: "",
    skills: "",
    requirements: "",
    deliverables: "",
    type: "project",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
    "Video Editing",
    "Translation",
    "Other",
  ];

  const difficulties = [
    { value: "easy", label: "Easy", color: "text-green-400" },
    { value: "medium", label: "Medium", color: "text-yellow-400" },
    { value: "hard", label: "Hard", color: "text-red-400" },
    { value: "expert", label: "Expert", color: "text-purple-400" },
  ];

  const taskTypes = [
    { value: "project", label: "Project" },
    { value: "contest", label: "Contest" },
    { value: "hourly", label: "Hourly Work" },
    { value: "fixed", label: "Fixed Price" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        ...formData,
        price: parseFloat(formData.price),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        requirements: formData.requirements
          .split("\n")
          .filter((req) => req.trim()),
        deliverables: formData.deliverables
          .split("\n")
          .filter((del) => del.trim()),
      };

      const newTask = await adminService.createTask(taskData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "medium",
        price: "",
        deadline: "",
        skills: "",
        requirements: "",
        deliverables: "",
        type: "project",
      });

      onTaskCreated(newTask);
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert(`Error creating task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white"
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
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter task title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.category ? "border-red-500" : "border-gray-600"
                }`}
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">{errors.category}</p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.price ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
              )}
            </div>

            {/* Task Type */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Task Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {taskTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Deadline *
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.deadline ? "border-red-500" : "border-gray-600"
                }`}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-400">{errors.deadline}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Describe the task in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Required Skills
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="React, Node.js, MongoDB (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-400">
                Separate skills with commas
              </p>
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="List requirements (one per line)..."
              />
              <p className="mt-1 text-xs text-gray-400">
                Each line will be a separate requirement
              </p>
            </div>

            {/* Deliverables */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Deliverables
              </label>
              <textarea
                name="deliverables"
                value={formData.deliverables}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="List expected deliverables (one per line)..."
              />
              <p className="mt-1 text-xs text-gray-400">
                Each line will be a separate deliverable
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-6 mt-8 space-x-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
