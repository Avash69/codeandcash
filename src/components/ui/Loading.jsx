/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  const getSizeClasses = () => {
    const sizes = {
      small: "w-4 h-4",
      medium: "w-8 h-8",
      large: "w-12 h-12",
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${getSizeClasses()} border-b-2 border-primary rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-2 text-sm text-text-muted">{text}</p>}
    </div>
  );
};

/**
 * Table Loading Component
 */
export const TableLoading = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-border">
          <div className="flex px-6 py-4 space-x-4">
            {[...Array(columns)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 h-4 rounded bg-surfaceHighlight"
                style={{ maxWidth: `${Math.random() * 200 + 100}px` }}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Card Loading Component
 */
export const CardLoading = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="p-6 border rounded-lg bg-surface border-border animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-24 h-4 rounded bg-surfaceHighlight"></div>
            <div className="w-6 h-6 rounded bg-surfaceHighlight"></div>
          </div>
          <div className="w-16 h-8 rounded bg-surfaceHighlight"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Page Loading Component
 */
export const PageLoading = ({ text = "Loading page..." }) => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto border-b-2 rounded-full border-primary animate-spin"></div>
        <p className="mt-4 text-text-muted">{text}</p>
      </div>
    </div>
  );
};

// Default export for backwards compatibility
const Loading = PageLoading;
export default Loading;
