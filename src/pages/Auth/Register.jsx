import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiHash, FiCheckCircle } from 'react-icons/fi';
import { account, ID, createUser } from '../../../src/appwrite'; // adjust path if needed
import { sendPasswordReset } from '../../services/authService'; // adjust path if needed

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleUser, setGoogleUser] = useState(null); // Store Google user info
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    rollNo: '',
    password: '',
    confirmPassword: '',
  });

  // Add this useEffect to check for authenticated user on mount
  useEffect(() => {
    const checkGoogleUser = async () => {
      try {
        const user = await account.get();
        if (user && user.email) {
          setGoogleUser(user);
          setFormData(prev => ({
            ...prev,
            email: user.email,
          }));
        }
      } catch (err) {
        // Not logged in, do nothing
      }
    };
    checkGoogleUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.phone.trim()) return setError('Phone is required');
    if (!formData.branch.trim()) return setError('Branch is required');
    if (!formData.rollNo.trim()) return setError('Roll Number is required');
    if (!formData.password.trim()) return setError('Password is required');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        rollNo: formData.rollNo,
        role: 'student',
        authId: googleUser.$id
      });

      // Send password reset link so user can set their password
      await sendPasswordReset(formData.email, window.location.origin + '/reset-password');

      setSuccess('Registration successful! Please check your email to set your password. After setting your password, you can log in.');
      // DO NOT log out here!
      // Optionally, you can log out after password is set, or prompt user to log out manually.
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Appwrite OAuth2 Google login
      await account.createOAuth2Session(
        'google',
        window.location.href, // Success redirect
        window.location.href  // Failure redirect
      );
      // After redirect, fetch user info
      const user = await account.get();
      setGoogleUser(user);
      setFormData(prev => ({
        ...prev,
        email: user.email,
      }));
    } catch (err) {
      setError('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoToLogin = async (e) => {
    e.preventDefault();
    try {
      await account.deleteSession('current');
    } catch (err) {
      // Ignore errors (session may already be deleted)
    }
    navigate('/login');
  };

  const branchOptions = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics Engineering'
  ];

  if (!googleUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Register with Google
        </h2>
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5.1-.7.1-1.3.1-2V20z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.6 16.1 19.5 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 45c5.3 0 10.1-1.8 13.8-4.8l-6.4-5.2C29.6 36 26.9 37 24 37c-5.5 0-10.1-3.7-11.7-8.7l-7 5.4C7.2 41.1 14.9 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5c2.1 0 4 .7 5.5 2.1l6.6-6.6C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/></g></svg>
          {googleLoading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <FiCheckCircle className="text-green-600 text-xl" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Create an account
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiUser className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiMail className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="input pl-10"
              placeholder="Enter your email"
              required
              disabled
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiPhone className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input pl-10"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        {/* Roll Number */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Roll Number*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiHash className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              className="input pl-10"
              placeholder="Enter your roll number"
              required
            />
          </div>
        </div>

        {/* Branch */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Branch*
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select your branch</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        {/* <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiLock className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input pl-10"
              placeholder="Create a password"
              required
            />
          </div>
        </div> */}

        {/* Confirm Password */}
        {/* <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password*
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiLock className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input pl-10"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <FiUserPlus className="mr-2" />
              Register
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/login"
            onClick={handleGoToLogin}
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
