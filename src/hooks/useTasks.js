/**
 * Tasks management custom hook
 */

import { useCallback, useEffect, useState } from "react";
import {
  applyForTask,
  approveTaskApplication,
  createTask,
  deleteTask,
  getTasks,
  submitTaskCompletion,
  updateTask,
} from "../api/taskService";

export const useTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTasks = useCallback(
    async (newFilters = filters) => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getTasks(newFilters);

      if (fetchError) {
        setError(fetchError);
      } else {
        setTasks(data || []);
      }

      setLoading(false);
    },
    [filters]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    const { data, error: createError } = await createTask(taskData);

    if (createError) {
      setError(createError);
      return { success: false, error: createError };
    }

    setTasks((prev) => [data, ...prev]);
    return { success: true, data };
  };

  const updateTaskData = async (taskId, taskData) => {
    const { data, error: updateError } = await updateTask(taskId, taskData);

    if (updateError) {
      setError(updateError);
      return { success: false, error: updateError };
    }

    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...data } : task))
    );
    return { success: true, data };
  };

  const removeTask = async (taskId) => {
    const { error: deleteError } = await deleteTask(taskId);

    if (deleteError) {
      setError(deleteError);
      return { success: false, error: deleteError };
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    return { success: true };
  };

  const applyToTask = async (taskId, applicationData) => {
    const { data, error: applyError } = await applyForTask(
      taskId,
      applicationData
    );

    if (applyError) {
      setError(applyError);
      return { success: false, error: applyError };
    }

    // Update task applicants count
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, applicants: (task.applicants || 0) + 1 }
          : task
      )
    );

    return { success: true, data };
  };

  const approveTask = async (taskId, approvalData) => {
    const { data, error: approveError } = await approveTaskApplication(
      taskId,
      approvalData
    );

    if (approveError) {
      setError(approveError);
      return { success: false, error: approveError };
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "approved", ...data } : task
      )
    );

    return { success: true, data };
  };

  const submitTask = async (taskId, submissionData) => {
    const { data, error: submitError } = await submitTaskCompletion(
      taskId,
      submissionData
    );

    if (submitError) {
      setError(submitError);
      return { success: false, error: submitError };
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "submitted", ...data } : task
      )
    );

    return { success: true, data };
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    tasks,
    loading,
    error,
    filters,
    fetchTasks,
    addTask,
    updateTask: updateTaskData,
    removeTask,
    applyToTask,
    approveTask,
    submitTask,
    updateFilters,
    clearFilters,
    refetch: () => fetchTasks(),
  };
};
