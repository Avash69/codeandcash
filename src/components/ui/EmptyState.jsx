import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "../../utils";

/**
 * EmptyState component for when no tasks are found
 * @param {string} activeTab - Currently active tab to show appropriate message
 */
export const EmptyState = ({ activeTab }) => (
  <motion.div {...ANIMATION_VARIANTS.scaleIn} className="py-16 text-center">
    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo/20 to-purple-600/20">
      <span className="text-4xl">📭</span>
    </div>
    <h3 className="mb-2 text-xl font-semibold text-text-primary">
      No {activeTab === "all" ? "" : activeTab} tasks found
    </h3>
    <p className="max-w-md mx-auto text-text-secondary">
      {activeTab === "all"
        ? "There are no tasks in the system yet. Create your first task to get started!"
        : `No tasks with status "${activeTab}" at the moment.`}
    </p>
  </motion.div>
);
