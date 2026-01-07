const SimpleExplore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Explore Tasks (Simple Version)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sample Task Card */}
          <div className="bg-navy-light p-6 rounded-lg border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Sample Task
            </h3>
            <p className="text-text-secondary mb-4">
              This is a sample task to test the component rendering.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-yellow-400">$500</span>
              <span className="text-sm text-text-secondary">5 days</span>
            </div>
          </div>

          {/* Another Sample Task */}
          <div className="bg-navy-light p-6 rounded-lg border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Another Task
            </h3>
            <p className="text-text-secondary mb-4">
              Another sample task for testing purposes.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-yellow-400">$300</span>
              <span className="text-sm text-text-secondary">3 days</span>
            </div>
          </div>

          {/* Third Sample Task */}
          <div className="bg-navy-light p-6 rounded-lg border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Third Task
            </h3>
            <p className="text-text-secondary mb-4">
              Third sample task for testing.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-yellow-400">$750</span>
              <span className="text-sm text-text-secondary">7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleExplore;
