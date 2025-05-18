import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUserPlus,
  FiTrash,
  FiEdit,
  FiMail,
  FiPhone,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

import { createUser} from '../../../src/appwrite'; // Make sure this path is correct based on your project structure

const ManageUsers = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Student',
      email: 'john@example.com',
      phone: '1234567890',
      role: 'student',
      branch: 'Computer Science',
      createdAt: '2023-10-01T10:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Teacher',
      email: 'jane@example.com',
      phone: '9876543210',
      role: 'teacher',
      department: 'Computer Science',
      createdAt: '2023-09-15T08:30:00Z',
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    branch: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await account.create(
        ID.unique(),
        newUser.email,
        newUser.password,
        newUser.name
      );

      await account.updatePrefs({ role: newUser.role });

      const user = {
        id: response.$id,
        ...newUser,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setUsers(prev => [user, ...prev]);
      setShowAddForm(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'student',
        branch: '',
        password: ''
      });
      alert('User created successfully!');
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'all' && user.role !== filters.role) return false;
    if (filters.status !== 'all' && user.status !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Manage Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Add, edit, or remove users from the platform</p>
        </div>
        <button onClick={() => setShowAddForm(prev => !prev)} className="btn btn-primary">
          <FiUserPlus className="mr-2" />
          Add User
        </button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Add New User</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
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
                onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
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
                onChange={e => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                className="input"
              />
            </div>
            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="input"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            {/* Branch/Department */}
            <div>
              <label className="mb-1 block text-sm font-medium">Branch/Department</label>
              <input
                type="text"
                value={newUser.branch}
                onChange={e => setNewUser(prev => ({ ...prev, branch: e.target.value }))}
                className="input"
                required
              />
            </div>
            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                className="input"
                required
              />
            </div>
            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add User
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <select
            value={filters.role}
            onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
            className="input max-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input max-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
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
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role === 'student' ? user.branch : user.department}
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
                    <span className={`badge ${
                      user.role === 'student' ? 'badge-primary' : 'badge-secondary'
                    }`}>
                      {user.role === 'student' ? 'Student' : 'Teacher'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`badge ${
                      user.status === 'active' ? 'badge-success' : 'badge-error'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Edit">
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded-full p-1.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/30"
                        title="Delete"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
