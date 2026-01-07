/**
 * Custom hook for Explore Tasks page
 * Handles task filtering, categories, and difficulties
 */

import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:5002/api";

export const useExploreTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/categories`);
      const data = await res.json();
      setCategories(data.data || []);
    } catch {
      setError("Failed to load categories");
    }
  }, []);

  // Fetch difficulties from API
  const fetchDifficulties = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/difficulties`);
      const data = await res.json();
      setDifficulties(data.data || []);
    } catch {
      setError("Failed to load difficulties");
    }
  }, []);

  // Fetch tasks with filters from API
  const fetchTasks = useCallback(
    async (newFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(newFilters).toString();
        const res = await fetch(`${API_BASE}/tasks?${params}`);
        const data = await res.json();
        setTasks(data.data?.tasks || []);
      } catch {
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchDifficulties();
    fetchTasks(initialFilters);
    // eslint-disable-next-line
  }, []);

  // Update filters
  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      fetchTasks(newFilters);
    },
    [fetchTasks]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    fetchTasks({});
  }, [fetchTasks]);

  // Refresh tasks with current filters
  const refreshTasks = useCallback(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  return {
    tasks,
    categories,
    difficulties,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refreshTasks,
    fetchTasks,
  };
};
