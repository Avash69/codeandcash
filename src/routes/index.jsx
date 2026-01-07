import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

// Lazy load components
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Signup = lazy(() => import("../pages/auth/Signup.jsx"));
const Exploretask = lazy(() => import("../pages/tasks/Exploretask.jsx"));
const TaskDetails = lazy(() => import("../pages/tasks/TaskDetails.jsx"));
const Applytask = lazy(() => import("../pages/tasks/Applytask.jsx"));
const MyAppliedTasks = lazy(() => import("../pages/tasks/MyAppliedTasks.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const ColorPalette = lazy(() => import("../components/ColorPalette.jsx"));
const AdminHelper = lazy(() => import("../pages/AdminHelper.jsx"));

// Admin Layout and Components
const AdminLayout = lazy(() => import("../layouts/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.jsx"));
const UsersManagement = lazy(() =>
  import("../pages/admin/UsersManagement.jsx")
);
const TasksManagement = lazy(() =>
  import("../pages/admin/TasksManagement.jsx")
);
const ApplicationsManagement = lazy(() =>
  import("../pages/admin/ApplicationsManagement.jsx")
);
const ActivityLogs = lazy(() => import("../pages/admin/ActivityLogs.jsx"));

// Placeholder page for routes that don't have implementations yet
const PlaceholderPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-indigo-950">
    <div className="max-w-md p-8 bg-indigo-900 rounded-lg shadow-lg backdrop-blur-sm shadow-indigo-900/50">
      <h1 className="mb-4 text-3xl font-bold text-slate-50">Coming Soon</h1>
      <p className="mb-6 text-slate-300">
        This page is under development and will be available soon.
      </p>
      <Link
        to="/dashboard"
        className="inline-block px-4 py-2 bg-indigo-600 rounded-md shadow-lg text-slate-50 hover:bg-indigo-500 shadow-indigo-600/20"
      >
        Return to Dashboard
      </Link>
    </div>
  </div>
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-indigo-950">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-300">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Landing and Auth Pages */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Handle case-insensitive routes for auth */}
        <Route path="/Login" element={<Navigate to="/login" replace />} />
        <Route path="/Signup" element={<Navigate to="/signup" replace />} />

        {/* Main Application Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/Dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Profile" element={<Navigate to="/profile" replace />} />

        {/* Task Related Routes */}
        <Route path="/exploretask" element={<Exploretask />} />
        <Route path="/tasks/explore" element={<Exploretask />} />
        <Route
          path="/Exploretask"
          element={<Navigate to="/exploretask" replace />}
        />
        <Route path="/my-tasks" element={<MyAppliedTasks />} />
        <Route path="/tasks/my-applied" element={<MyAppliedTasks />} />
        <Route path="/task-details/:id" element={<TaskDetails />} />
        <Route
          path="/Task-details/:id"
          element={<Navigate to="/task-details/:id" replace />}
        />
        <Route path="/applytask" element={<Applytask />} />
        <Route path="/applytask/:id" element={<Applytask />} />
        <Route
          path="/Applytask"
          element={<Navigate to="/applytask" replace />}
        />

        {/* Color Palette - Dev Tool */}
        <Route path="/colors" element={<ColorPalette />} />

        {/* Admin Helper Tool */}
        <Route path="/admin-helper" element={<AdminHelper />} />

        {/* Placeholder routes for incomplete pages */}
        <Route path="/developers" element={<PlaceholderPage />} />
        <Route path="/business" element={<PlaceholderPage />} />
        <Route path="/help" element={<PlaceholderPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="tasks" element={<TasksManagement />} />
          <Route path="applications" element={<ApplicationsManagement />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
        </Route>

        {/* Catch all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
