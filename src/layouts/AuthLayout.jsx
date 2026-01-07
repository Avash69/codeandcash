/**
 * Authentication layout for login/signup pages
 */

import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy">
      <div className="flex items-center justify-center min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};
