import { motion } from "framer-motion";

/**
 * Confirmation Modal Component
 *
 * Reusable modal for confirmation dialogs
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger", // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    const styles = {
      danger: "bg-red-600 hover:bg-red-700",
      warning: "bg-yellow-600 hover:bg-yellow-700",
      info: "bg-blue-600 hover:bg-blue-700",
    };
    return styles[type] || styles.danger;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-6 border shadow-xl bg-surface rounded-xl border-border mx-4"
      >
        <div className="flex items-center mb-4">
          {type === "danger" && (
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          )}
          {type === "warning" && (
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          )}
          {type === "info" && (
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mx-auto bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <div className="ml-4">
            <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-text-secondary">{message}</p>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 transition-colors border rounded-lg bg-surface border-border text-text-secondary hover:bg-surfaceHighlight hover:text-text-primary disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${getButtonStyles()}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Default export for backwards compatibility
export default ConfirmationModal;
