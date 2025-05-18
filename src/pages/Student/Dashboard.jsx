import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiFileText, FiVideo, FiHelpCircle, FiMessageSquare, FiBookmark, FiActivity } from 'react-icons/fi';
import { getRecentResources } from '../../../src/appwrite';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Move fetchRecentResources outside useEffect so you can call it elsewhere
  const fetchRecentResources = async () => {
    try {
      setLoading(true);
      const recent = await getRecentResources();
      setRecentResources(recent);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentResources();
  }, []);
  
  // Quick access items
  const quickAccess = [
    { title: 'Notes', icon: FiBookOpen, color: 'bg-primary-500', link: '/student/notes' },
    { title: 'Syllabus', icon: FiFileText, color: 'bg-secondary-500', link: '/student/syllabus' },
    { title: 'Videos', icon: FiVideo, color: 'bg-accent-500', link: '/student/videos' },
    { title: 'PYQs', icon: FiHelpCircle, color: 'bg-success-500', link: '/student/pyqs' },
    { title: 'Community', icon: FiMessageSquare, color: 'bg-warning-500', link: '/student/community' },
  ];
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}!
          </p>
        </div>
      </div>
      
      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickAccess.map((item, index) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Link 
                to={item.link}
                className="flex flex-col items-center justify-center rounded-xl bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 border-b-4  dark:border-b-sky-600 dark:hover:border-b-sky-400"
              >
                <div className={`mb-3 rounded-full p-3 text-white ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Resources
            </h2>
            <div>
              <Link 
                to="/student/notes" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all
              </Link>
              <button
                onClick={fetchRecentResources}
                className="ml-4 text-xs px-2 py-1 rounded bg-primary-500 text-white hover:bg-primary-600"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
              </div>
            ) : recentResources.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <FiActivity className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No recent resources found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentResources.map((resource, index) => (
                  <motion.div
                    key={`${resource.type}-${resource.id}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <Link 
                      to={`/student/preview/${resource.type}/${resource.id}`}
                      className="flex items-start gap-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <img 
                          src={resource.thumbnailUrl} 
                          alt={resource.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-primary">
                            {resource.type === 'syllabus' ? ' Syllabus' : 
                             resource.type === 'video' ? 'Video' : 
                             resource.type === 'pyq' ? 'PYQ' :
                             resource.type === 'notes' ? 'Notes' : 'Resource'
                             }
                          </span>
                          {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(resource.uploadDate)}
                          </span> */}
                        </div>
                        <h3 className="line-clamp-1 font-medium text-gray-900 dark:text-white">
                          {resource.title}
                        </h3>
                        <p className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                          {resource.subject || resource.branch}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Bookmarks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Bookmarks
            </h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all
            </button>
          </div>
          
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                <FiBookmark className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                No bookmarks yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bookmark resources to access them quickly later
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;