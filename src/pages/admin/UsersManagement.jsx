import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminService } from "../../api/adminService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";

/**
 * Users management component for admins
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

  const itemsPerPage = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      const response = await adminService.getUsers(
        currentPage,
        itemsPerPage,
        filters
      );

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
      } else if (response?.users === undefined && Array.isArray(response.data)) {
        // Fallback for some API structures
        setUsers(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalUsers(response.total || response.data.length);
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
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    const searchParam = params.get("search");
    const pageParam = params.get("page");

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
      await Promise.all(
        selectedUsers.map((userId) => adminService.deleteUser(userId))
      );

      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user._id || user.id))
      );
      setTotalUsers((prev) => prev - selectedUsers.length);
      setSelectedUsers([]);
      setActionSuccess(`${selectedUsers.length} users deleted successfully`);

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
        bg: "bg-purple-100 text-purple-800 border-purple-200",
      },
      client: {
        bg: "bg-blue-100 text-blue-800 border-blue-200",
      },
      user: {
        bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${config.bg}`}
      >
        {role}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-secondary">
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

      <div className="p-4 bg-white border rounded-xl border-border shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute text-text-muted transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-text-muted transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="developer">Developer</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 mt-4 border-t border-slate-200"
          >
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete Selected ({selectedUsers.length})
            </button>
          </motion.div>
        )}

        {/* Success Message */}
        <AnimatePresence>
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
        </AnimatePresence>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white border rounded-xl border-border shadow-sm">
        {error ? (
          <div className="p-8 text-center text-red-500">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm mt-1 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={users.length > 0 && selectedUsers.length === users.length}
                        onChange={handleSelectAllUsers}
                        className="w-4 h-4 text-primary bg-white rounded border-slate-300 focus:ring-primary focus:ring-2"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      User
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort("createdAt")}
                    >
                      Joined
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <motion.tr
                          key={user._id || user.id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id || user.id)}
                              onChange={() => handleSelectUser(user._id || user.id)}
                              className="w-4 h-4 text-primary bg-white rounded border-slate-300 focus:ring-primary focus:ring-2"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-sm border border-slate-200">
                                {(user.name || user.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-text-primary">{user.name || "Unknown User"}</div>
                                <div className="text-sm text-text-secondary">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(user.role || "user")}
                          </td>
                          <td className="px-6 py-4">
                            {/* Logic to determine if active - looking at lastActive if available, otherwise defaulting to 'Active' visually but could range based on data */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${user.isActive === false ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive === false ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                              {user.isActive === false ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => confirmDeleteUser(user)}
                              className="p-2 text-text-secondary transition-all rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-text-secondary">
                          <div className="flex flex-col items-center justify-center">
                            <Search className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-lg font-medium text-text-primary">No users found</p>
                            <p className="text-sm">Try adjusting your search or filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name || userToDelete?.email || "this user"
          }? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
};

export default UsersManagement;
