import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiEdit,
  FiMail,
  FiPhone,
  FiSearch,
  FiFilter,
} from "react-icons/fi";

import { createUser, fetchUsers, updateUser } from "../../../src/appwrite";
import { account, ID } from "../../../src/appwrite";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    search: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    branch: "",
    rollNo: "",
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    branch: "",
    rollNo: "",
    authId: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  // Fetch users from Appwrite on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        showToast("Error fetching users: " + error.message, "error");
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create user in Appwrite Auth
      const authUser = await account.create(
        ID.unique(),
        newUser.email,
        newUser.password || ID.unique(), // password is not in form, so use a random one or handle as needed
        newUser.name
      );

      // 2. Create user in your custom database collection, store Auth user id for reference
      const userData = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        branch: newUser.branch,
        rollNo: newUser.rollNo,
        authId: authUser.$id,
      };
      await createUser(userData);

      // 3. Refetch users after adding
      const data = await fetchUsers();
      setUsers(data);
      setShowAddForm(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "student",
        branch: "",
        rollNo: "",
      });
      showToast("User created successfully!", "success");
    } catch (error) {
      showToast("Error creating user: " + error.message, "error");
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user.$id);
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branch: user.branch,
      rollNo: user.rollNo,
      authId: user.authId,
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // 1. Update user in your custom database collection
      await updateUser(editUserId, {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
        branch: editUser.branch,
        rollNo: editUser.rollNo,
      });

      // 2. Update user in Appwrite Auth (if you have authId)
      if (editUser.authId) {
        // REMOVE or COMMENT OUT these lines:
        // try {
        //   await account.updateName(editUser.name);
        // } catch {}
        // try {
        //   await account.updateEmail(editUser.email);
        // } catch {}
      }

      const data = await fetchUsers();
      setUsers(data);
      setEditUserId(null);
      setEditUser({
        name: "",
        email: "",
        phone: "",
        role: "student",
        branch: "",
        rollNo: "",
        authId: "",
      });
      showToast("User updated successfully!", "success");
    } catch (error) {
      showToast("Error updating user: " + error.message, "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Manage Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all users from here
          </p>
        </div>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Add New User
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="input"
              />
            </div>
            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, role: e.target.value }))
                }
                className="input"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            {/* Branch/Department */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Branch/Department
              </label>
              <input
                type="text"
                value={newUser.branch}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, branch: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Roll No */}
            <div>
              <label className="mb-1 block text-sm font-medium">Roll No</label>
              <input
                type="text"
                value={newUser.rollNo}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, rollNo: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add User
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {editUserId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Edit User
          </h2>
          <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
            {/* Name (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={editUser.name}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Email (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={editUser.email}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Phone (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={editUser.phone}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Role (editable) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                value={editUser.role}
                onChange={(e) =>
                  setEditUser((prev) => ({ ...prev, role: e.target.value }))
                }
                className="input"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option> {/* <-- Add this line */}
              </select>
            </div>
            {/* Branch/Department (editable) */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Branch/Department
              </label>
              <input
                type="text"
                value={editUser.branch}
                onChange={(e) =>
                  setEditUser((prev) => ({ ...prev, branch: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Roll No (editable) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Roll No</label>
              <input
                type="text"
                value={editUser.rollNo}
                onChange={(e) =>
                  setEditUser((prev) => ({ ...prev, rollNo: e.target.value }))
                }
                className="input"
                required
              />
            </div>
            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditUserId(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update User
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <select
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value }))
            }
            className="input max-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option> {/* <-- Add this line */}
          </select>
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search users..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.$id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role === "student"
                            ? user.branch
                            : user.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <FiMail className="text-gray-400" size={14} />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiPhone className="text-gray-400" size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`badge ${
                        user.role === "student"
                          ? "badge-primary"
                          : user.role === "teacher"
                          ? "badge-secondary"
                          : user.role === "admin"
                          ? "badge-accent" // Use your accent or custom class for admin
                          : ""
                      }`}
                    >
                      {user.role === "student"
                        ? "Student"
                        : user.role === "teacher"
                        ? "Teacher"
                        : user.role === "admin"
                        ? "Admin"
                        : user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Edit"
                        onClick={() => handleEditClick(user)}
                      >
                        <FiEdit size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast.show && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded bg-${
            toast.type === "success" ? "green" : "red"
          }-500 px-6 py-3 text-white shadow-lg`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
