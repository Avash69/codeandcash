/**
 * Authentication custom hook
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  isLoggedIn,
  loginAPI,
  logout as logoutHelper,
  signupAPI,
} from "../api/authService.jsx";
import { ROUTES } from "../constants/appConstants";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    const { data, error: loginError, success } = await loginAPI(credentials);

    if (!success || loginError) {
      setError(loginError);
      setLoading(false);
      return { success: false, error: loginError };
    }

    setUser(data.user);
    setLoading(false);
    navigate(ROUTES.DASHBOARD);
    return { success: true, data };
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    const { data, error: registerError, success } = await signupAPI(userData);

    if (!success || registerError) {
      setError(registerError);
      setLoading(false);
      return { success: false, error: registerError };
    }

    setUser(data.user);
    setLoading(false);
    navigate(ROUTES.DASHBOARD);
    return { success: true, data };
  };

  const logout = async () => {
    setLoading(true);
    logoutHelper();
    setUser(null);
    setLoading(false);
    navigate(ROUTES.HOME);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
