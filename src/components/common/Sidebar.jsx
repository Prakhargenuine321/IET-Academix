import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHome, FiBookOpen, FiFileText, FiVideo, FiMessageSquare, FiUsers, FiBell, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

// Map of icon names to components
const iconMap = {
  Home: FiHome,
  BookOpen: FiBookOpen,
  FileText: FiFileText,
  Video: FiVideo,
  MessageSquare: FiMessageSquare,
  Users: FiUsers,
  Bell: FiBell,
  HelpCircle: FiHelpCircle,
  //FileQuestion: FiHelpCircle,
};

const Sidebar = ({ navigationItems, userRole, isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };
  
  // Get role-specific title and colors
  const getRoleSpecifics = () => {
    switch (userRole) {
      case 'student':
        return {
          title: 'Student Portal',
          bgClass: 'bg-primary-600',
        };
      case 'teacher':
        return {
          title: 'Teacher Portal',
          bgClass: 'bg-secondary-600',
        };
      case 'admin':
        return {
          title: 'Admin Panel',
          bgClass: 'bg-accent-600',
        };
      default:
        return {
          title: 'Smart College',
          bgClass: 'bg-primary-600',
        };
    }
  };
  
  const { title, bgClass } = getRoleSpecifics();
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Mobile sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg dark:bg-gray-800 md:hidden"
      >
        <div className={`flex items-center justify-between p-4 ${bgClass} text-white`}>
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon] || FiHelpCircle;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>
      
      {/* Desktop sidebar (always visible) */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 md:block">
        <div className={`flex items-center justify-between p-4 px-6 text-white bg-gradient-to-r from-blue-800 to-indigo-900`}>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-4 flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon] || FiHelpCircle;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;