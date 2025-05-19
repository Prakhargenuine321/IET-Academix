import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { sendPasswordReset } from "../../services/authService";
import { Link } from "react-router-dom";
import { fetchUsers } from "../../../src/appwrite"; // Adjust path if needed

const Login = () => {
  const { login, error: authError } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const navigate = useNavigate();

  // Login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/phone/roll no and password");
      return;
    }
    setLoading(true);
    try {
      const result = await login({ identifier, password });
      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
      } else {
        // Fetch all users and find the one with matching email
        const users = await fetchUsers();
        const user = users.find(
          (u) => u.email.toLowerCase() === identifier.toLowerCase()
        );
        if (user && user.role) {
          // Redirect based on role
          if (user.role === "student") {
            navigate("/student/dashboard");
          } else if (user.role === "teacher") {
            navigate("/teacher/dashboard");
          } else if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            setError("Unknown user role. Please contact support.");
          }
        } else {
          setError("User data not found.");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler
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

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Log in to your account
        </h2>

        {(error || authError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-300"
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
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your email, phone, or roll no"
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
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex justify-start mb-3">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline focus:outline-none"
              onClick={() => setShowResetModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2 px-5 py-2.5 text-sm text-white rounded-lg me-2 mb-2 
               backdrop-blur-md bg-blue-600/60 border border-white/30 
               hover:backdrop-blur-xl transition-all duration-300 ease-in-out hover:bg-blue-800/60 shadow-white/10 hover:shadow-lg 
               focus:ring-2 focus:ring-white/30 focus:outline-none 
               disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FiLogIn className="mr-2" />
                Log In
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-700 dark:text-gray-300">Don't have an account?</span>
          <Link
            to="/register"
            className="ml-2 font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 py-6 overflow-y-auto">
          <div className="rounded-lg bg-white p-6 dark:bg-gray-800 shadow-xl w-full max-w-sm">
            <h3 className="mb-4 text-lg font-bold">Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
    </>
  );
};

export default Login;
