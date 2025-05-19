import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHome, FiBookOpen, FiFileText, FiVideo, FiMessageSquare, FiUsers, FiBell, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';

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
};

const Sidebar = ({ navigationItems, userRole, isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Refs for nav items
  const navRefs = useRef([]);

  // GSAP hover/click animations
  useEffect(() => {
    navRefs.current.forEach((el, idx) => {
      if (!el) return;
      // Hover
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          scale: 1.07,
          boxShadow: '0 4px 24px 0 rgba(80,120,255,0.13)',
          background: 'rgba(255,255,255,0.18)',
          duration: 0.25,
          ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          scale: 1,
          boxShadow: '0 0px 0px 0 rgba(0,0,0,0)',
          background: 'transparent',
          duration: 0.25,
          ease: 'power2.inOut',
        });
      });
      // Click
      el.addEventListener('mousedown', () => {
        gsap.to(el, {
          scale: 0.96,
          duration: 0.12,
          ease: 'power1.in',
        });
      });
      el.addEventListener('mouseup', () => {
        gsap.to(el, {
          scale: 1.07,
          duration: 0.18,
          ease: 'power1.out',
        });
      });
    });
    // Cleanup
    return () => {
      navRefs.current.forEach((el) => {
        if (!el) return;
        el.replaceWith(el.cloneNode(true));
      });
    };
  }, [navigationItems]);

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
        };
      case 'teacher':
        return {
          title: 'Teacher Portal',
        };
      case 'admin':
        return {
          title: 'Admin Panel',
        };
      default:
        return {
          title: 'Smart College',
        };
    }
  };

  const { title } = getRoleSpecifics();

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
        className="fixed inset-y-0 left-0 z-30 w-64 shadow-xl md:hidden
          bg-white/30 dark:bg-gray-800/40 border-r border-white/30 dark:border-gray-700/40
          backdrop-blur-xl rounded-tr-2xl rounded-br-2xl"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        }}
      >
        <div className="flex items-center justify-between p-4 text-white bg-gradient-to-r from-blue-900/80 to-indigo-900/80 rounded-tr-2xl">
          <h2 className="text-lg font-semibold drop-shadow">{title}</h2>
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
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200 shadow-inner backdrop-blur">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item, idx) => {
              const Icon = iconMap[item.icon] || FiHelpCircle;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  ref={el => navRefs.current[idx] = el}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-700/60 to-indigo-700/60 text-white shadow-lg'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/40'
                    }`}
                  style={{
                    backdropFilter: 'blur(8px)',
                  }}
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
      <aside className="hidden w-64 border-r border-white/30 dark:border-gray-700/40 bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl shadow-xl md:block"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        }}
      >
        <div className="flex items-center justify-between p-4 px-6 text-white bg-gradient-to-r from-blue-900/80 to-indigo-900/80">
          <h2 className="text-lg font-semibold drop-shadow">{title}</h2>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200 shadow-inner backdrop-blur">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item, idx) => {
              const Icon = iconMap[item.icon] || FiHelpCircle;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  ref={el => navRefs.current[idx] = el}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-700/60 to-indigo-700/60 text-white shadow-lg'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/40'
                    }`}
                  style={{
                    backdropFilter: 'blur(8px)',
                  }}
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