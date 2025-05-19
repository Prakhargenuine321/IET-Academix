import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const Navbar = ({ onMenuClick, userRole }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const notifications = [
    { id: 1, text: "New syllabus uploaded", time: "2 hours ago" },
    { id: 2, text: "New message in community chat", time: "5 hours ago" },
    { id: 3, text: "Reminder: Assignment due tomorrow", time: "1 day ago" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
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
        return "IET Academix";
    }
  };

  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-md dark:bg-gray-900/80 shadow-md px-4 py-3 border-b border-gray-200 dark:border-gray-700 z-20 h-16">
      <div className="mx-auto flex items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={24} />
          </button>
          <Link
            to={`/${userRole}/dashboard`}
            className="text-xl font-bold text-blue-600 dark:text-white"
          >
            {getTitle()}
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 relative"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-100"
                >
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto z-30">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b dark:border-gray-700"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {n.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {n.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t dark:border-gray-700 text-center">
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white p-2 rounded-full"
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                        {user?.email}
                      </p>
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
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-600 bg-[length:200%_200%] bg-left transition-all duration-300 ease-out rounded-2xl shadow-md transform hover:scale-105 hover:bg-right focus:outline-none"
              style={{
                backgroundSize: "200% 200%",
                transition: "background-position 0.4s, transform 0.2s",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
