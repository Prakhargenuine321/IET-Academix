import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // Admin sidebar navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'Home' },
    { name: 'Manage Notes', href: '/admin/manage-notes', icon: 'BookOpen' },
    { name: 'Manage Syllabus', href: '/admin/manage-syllabus', icon: 'FileText' },
    { name: 'Manage Videos', href: '/admin/manage-videos', icon: 'Video' },
    { name: 'Manage PYQs', href: '/admin/manage-pyqs', icon: 'FileQuestion' },
    { name: 'Manage Users', href: '/admin/manage-users', icon: 'Users' },
    { name: 'Announcements', href: '/admin/announcements', icon: 'Bell' },
    { name: 'AI Help', href: '/admin/ai-help', icon: 'Zap' },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for larger screens */}
      <Sidebar 
        navigationItems={navigationItems}
        userRole="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)}
          userRole="admin"
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;