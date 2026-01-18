/**
 * Pagination Component
 *
 * Provides pagination controls with page navigation
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t bg-surface border-border">
      <div className="flex items-center">
        <p className="text-sm text-text-secondary">
          Page <span className="font-medium text-text-primary">{currentPage}</span> of{" "}
          <span className="font-medium text-text-primary">{totalPages}</span>
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium transition-colors border rounded-lg bg-background border-border text-text-primary hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex space-x-1">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background border border-border text-text-secondary hover:bg-surfaceHighlight hover:text-text-primary"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium transition-colors border rounded-lg bg-background border-border text-text-primary hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/**
 * Simple Pagination Component
 */
export const SimplePagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center py-4 space-x-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-lg bg-surface border-border text-text-secondary hover:bg-surfaceHighlight hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Previous
      </button>

      <span className="px-4 py-2 text-sm font-medium text-text-secondary">
        {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-lg bg-surface border-border text-text-secondary hover:bg-surfaceHighlight hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

// Default export for backwards compatibility
export default Pagination;
