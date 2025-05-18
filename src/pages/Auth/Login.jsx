import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiLogIn } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { sendPasswordReset } from "../../services/authService";

const Login = () => {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ identifier: email, password });

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetStatus("Please enter your email");
      return;
    }
    try {
      await sendPasswordReset(resetEmail, window.location.origin + "/reset-password");
      setResetStatus("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setResetStatus(err.message || "Failed to send reset email");
    }
  };

  const loginOptions = [
    { label: "Student", value: "student@example.com", password: "password123" },
    { label: "Teacher", value: "teacher@example.com", password: "password123" },
    { label: "Admin", value: "admin@example.com", password: "password123" },
  ];

  const handleQuickLogin = (option) => {
    setEmail(option.value);
    setPassword(option.password);
  };

  return (
    <div>
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Log in to your account
      </h2>

      {(error || authError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-error-100 p-3 text-error-800 dark:bg-error-900/30 dark:text-error-300"
        >
          {error || authError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiMail className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiLock className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-bold">Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mb-4 w-full rounded border p-2 text-black"
              placeholder="Enter your email"
            />
            <div className="flex justify-end">
              <button
                onClick={handleResetPassword}
                className="mr-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Send Reset Link
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
            {resetStatus && <p className="mt-2 text-sm text-red-600">{resetStatus}</p>}
          </div>
        </div>
      )}

      <div className="mt-6">
        {/* <p className="mb-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Register here
          </Link>
        </p> */}

        <div className="mt-4">
          {/* <p className="mb-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Quick login for demo (click to autofill):
          </p> */}
          <div className="flex justify-center gap-2">
            {/* {loginOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleQuickLogin(option)}
                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                {option.label}
              </button>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
