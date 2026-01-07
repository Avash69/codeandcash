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
        className={`${getSizeClasses()} border-b-2 border-indigo-500 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-2 text-gray-300 text-sm">{text}</p>}
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
        <div key={rowIndex} className="border-b border-gray-700">
          <div className="px-6 py-4 flex space-x-4">
            {[...Array(columns)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-700 rounded flex-1"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            <div className="h-6 w-6 bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-16"></div>
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
        <div className="w-12 h-12 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-300">{text}</p>
      </div>
    </div>
  );
};

// Default export for backwards compatibility
const Loading = PageLoading;
export default Loading;
