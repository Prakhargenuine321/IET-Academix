import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { account } from "../../../src/appwrite"; // adjust path if needed

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract userId and secret from URL
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId");
  const secret = params.get("secret");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!password || !confirmPassword) {
      setStatus("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    try {
      await account.updateRecovery(userId, secret, password, confirmPassword);
      setStatus("Password updated! You can now log in.");
      await account.deleteSessions();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus(err.message || "Failed to reset password.");
    }
  };

  if (!userId || !secret) {
    return <div className="text-center mt-10 text-red-600">Invalid or expired reset link.</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 mt-10">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Reset Your Password
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Reset Password
        </button>
        {status && (
          <div className="mt-4 text-center text-red-600">{status}</div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;