import { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiUser, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { fetchUserNotifications } from "../../../src/appwrite"; // adjust path

const Navbar = ({ onMenuClick, userRole }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    switch (userRole) {
      case "student":
        return "Student Portal";
      case "teacher":
        return "Teacher Portal";
      case "admin":
        return "Admin Panel";
      default:
        return "Smart College";
    }
  };

  const handleShowNotifications = async () => {
    setShowNotifications(prev => !prev);

    // Fetch notifications only if opening notification panel & user exists
    if (!showNotifications && user) {
      try {
        console.log("User branch:", user.branch); // Debug user branch

        const data = await fetchUserNotifications(user.branch);
        setNotifications(
          data.map(n => ({
            id: n.$id,
            text: n.title,
            content: n.content,
            time: new Date(n.createdAt).toLocaleString(),
            priority: n.priority,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setNotifications([]);
      }
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={24} />
          </button>
          {/* <Link to={`/${userRole}/dashboard`} className="flex items-center">
            <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
              {getTitle()}
            </span>
          </Link> */}
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleShowNotifications}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Notifications"
            >
              <div className="relative">
                <FiBell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-xs text-white">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-md dark:bg-gray-800 z-30"
                >
                  <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {notifications.length === 0 && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        No notifications
                      </p>
                    )}
                    {notifications.map(notification => (
                      <div key={notification.id} className="mb-3 border-b pb-2">
                        <p className="text-sm font-semibold">{notification.text}</p>
                        <p className="text-xs">{notification.content}</p>
                        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                          {notification.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                    <button className="text-xs font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
              aria-label="User menu"
            >
              <FiUser size={18} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10"
                >
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <FiLogOut className="mr-2" size={16} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
