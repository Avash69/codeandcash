const BackendNoticeCard = ({ message, type = "warning" }) => {
  const getStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "warning":
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      case "warning":
      default:
        return "⚠️";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStyles()} mb-4`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getIcon()}</span>
        <div>
          <h3 className="font-semibold text-sm">Backend Notice</h3>
          <p className="text-sm mt-1">{message}</p>
          <p className="text-xs mt-2 opacity-75">
            This is a frontend-only demo. Backend endpoints are not yet fully
            implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackendNoticeCard;
