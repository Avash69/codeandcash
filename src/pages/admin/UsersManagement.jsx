import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminService } from "../../api/adminService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";

/**
 * Users Management Component
 *
 * A clean, simplified users management interface aligned with backend API endpoints:
 * - List Users: GET /api/admin/users?page=1&limit=20&search=
 * - Get User Details: GET /api/admin/users/:id
 * - Edit User: PUT /api/admin/users/:id
 * - Delete User: DELETE /api/admin/users/:id
 */
const UsersManagement = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionSuccess, setActionSuccess] = useState(null);

  const itemsPerPage = 20; // Matches the API limit parameter

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      // API endpoint: GET /api/admin/users?page=1&limit=20&search=
      const response = await adminService.getUsers(
        currentPage,
        itemsPerPage,
        filters
      );

      // Handle different response formats from backend
      if (response?.users) {
        setUsers(response.users);
        setTotalPages(
          response.totalPages || Math.ceil(response.total / itemsPerPage)
        );
        setTotalUsers(response.total || response.users.length);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalUsers(response.length);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter]);

  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    const searchParam = params.get("search");
    const pageParam = params.get("page");

    // Apply filters from URL if they exist
    if (roleParam) setRoleFilter(roleParam);
    if (searchParam) setSearchTerm(searchParam);
    if (pageParam) setCurrentPage(parseInt(pageParam, 10));
  }, [location.search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id || user.id));
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);

      // API endpoint: DELETE /api/admin/users/:id
      await adminService.deleteUser(userToDelete._id || userToDelete.id);

      setUsers((prev) =>
        prev.filter(
          (user) =>
            (user._id || user.id) !== (userToDelete._id || userToDelete.id)
        )
      );
      setSelectedUsers((prev) =>
        prev.filter((id) => id !== (userToDelete._id || userToDelete.id))
      );
      setTotalUsers((prev) => prev - 1);
      setShowDeleteModal(false);
      setUserToDelete(null);
      setActionSuccess("User deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setLoading(true);

      // Perform multiple DELETE requests for each selected user
      await Promise.all(
        selectedUsers.map((userId) => adminService.deleteUser(userId))
      );

      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user._id || user.id))
      );
      setTotalUsers((prev) => prev - selectedUsers.length);
      setSelectedUsers([]);
      setActionSuccess(`${selectedUsers.length} users deleted successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
      },
      user: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
      },
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {role}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden border-b bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="relative px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-transparent lg:text-4xl bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text">
                Users Management
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Manage and monitor all platform users
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Total: {totalUsers}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Selected: {selectedUsers.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-6 mb-8 border shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border-slate-200/60 dark:border-slate-700/60 shadow-slate-900/5"
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full py-3 pl-10 pr-4 transition-all border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 transition-all border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedUsers.length} user(s) selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete Selected
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center p-4 mt-4 text-sm text-green-800 bg-green-100 rounded-lg"
            >
              <Check className="w-5 h-5 mr-2" />
              {actionSuccess}
            </motion.div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 mb-6 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full dark:bg-red-800">
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Error loading users
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="ml-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-hidden border shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border-slate-200/60 dark:border-slate-700/60 shadow-slate-900/5"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                Loading users...
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                No users found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || roleFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No users have been registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50/80 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={
                          users.length > 0 &&
                          selectedUsers.length === users.length
                        }
                        onChange={handleSelectAllUsers}
                        className="w-4 h-4 text-blue-600 bg-white rounded border-slate-300 focus:ring-blue-500 focus:ring-2"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase transition-colors cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {sortField === "name" && (
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              sortOrder === "desc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      Role
                    </th>
                    <th
                      className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase transition-colors cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        Joined
                        {sortField === "createdAt" && (
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              sortOrder === "desc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id || user.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 group"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(
                              user._id || user.id
                            )}
                            onChange={() =>
                              handleSelectUser(user._id || user.id)
                            }
                            className="w-4 h-4 text-blue-600 bg-white rounded border-slate-300 focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                              {(
                                user.name ||
                                user.firstName ||
                                user.username ||
                                user.email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {user.name ||
                                  `${user.firstName || ""} ${
                                    user.lastName || ""
                                  }`.trim() ||
                                  user.username ||
                                  user.email ||
                                  "Unknown User"}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user.role || "user")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                confirmDeleteUser(user);
                              }}
                              className="p-2 text-red-600 transition-all rounded-lg opacity-0 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:opacity-100"
                              title="Delete user"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${
          userToDelete?.name || userToDelete?.email || "this user"
        }? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
};

export default UsersManagement;
