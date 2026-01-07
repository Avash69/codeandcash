import { useState } from "react";
import {
  TaskContext,
  initialSubmissions,
  initialTasks,
} from "./TaskContext.jsx";

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [submissions, setSubmissions] = useState(initialSubmissions);

  // Add new task
  const addTask = (newTask) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...newTask,
        id: Math.max(...prevTasks.map((t) => t.id)) + 1,
        status: "open",
        applicants: 0,
      },
    ]);
  };

  // Get tasks by status
  const getOpenTasks = () => tasks.filter((task) => task.status === "open");
  const getApprovedTasks = () =>
    tasks.filter((task) => task.status === "approved");
  const getSubmittedTasks = () =>
    tasks.filter((task) => task.status === "submitted");

  // Get task statistics
  const getTaskStats = () => {
    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status === "open").length,
      approved: tasks.filter((task) => task.status === "approved").length,
      submitted: tasks.filter((task) => task.status === "submitted").length,
    };
  };

  // Approve task
  const approveTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: "approved" } : task
      )
    );
  };

  // Submit task
  const submitTask = (taskId, submission) => {
    setSubmissions((prevSubmissions) => [...prevSubmissions, submission]);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: "submitted" } : task
      )
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        submissions,
        addTask,
        getOpenTasks,
        getApprovedTasks,
        getSubmittedTasks,
        getTaskStats,
        approveTask,
        submitTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
