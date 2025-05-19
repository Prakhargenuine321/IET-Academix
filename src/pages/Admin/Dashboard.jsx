import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiFileText, FiVideo, FiMessageSquare, FiDownload, FiEye } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { fetchUsers, getResourceNotes, getSyllabus, fetchPYQs, fetchVideos, getRecentResources } from '../../../src/appwrite';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // State for real data
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [pyqs, setPYQs] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const users = await fetchUsers();
        setStudents(users.filter(u => u.role === 'student'));
        setTeachers(users.filter(u => u.role === 'teacher'));

        const notesData = await getResourceNotes();
        setNotes(Array.isArray(notesData) ? notesData : notesData.documents || []);

        setVideos(await fetchVideos());
        setSyllabus(await getSyllabus());
        setPYQs(await fetchPYQs());

        // Fetch recent uploads
        const recent = await getRecentResources();
        setRecentUploads(Array.isArray(recent) ? recent : recent.documents || []);
      } catch (err) {
        // handle error if needed
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const stats = [
    { title: 'Total Students', value: students.length, icon: FiUsers, color: 'bg-primary-500' },
    { title: 'Total Teachers', value: teachers.length, icon: FiUsers, color: 'bg-secondary-500' },
    { title: 'Total Notes', value: notes.length, icon: FiBookOpen, color: 'bg-accent-500' },
    { title: 'Total Videos', value: videos.length, icon: FiVideo, color: 'bg-success-500' },
  ];
  
  // Resource engagement data
  const resourceEngagement = [
    { type: 'Notes', count: notes.length, color: 'primary' },
    { type: 'Syllabus', count: syllabus.length, color: 'secondary' },
    { type: 'Videos', count: videos.length, color: 'accent' },
    { type: 'PYQs', count: pyqs.length, color: 'success' },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              activeTab === 'overview'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
        </div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Link 
            to="/admin/manage-notes" 
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <FiBookOpen size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload & organize</p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link 
            to="/admin/manage-videos" 
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
              <FiVideo size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Videos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add & organize</p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link 
            to="/admin/manage-users" 
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400">
              <FiUsers size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Students & teachers</p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link 
            to="/admin/announcements" 
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <FiMessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Announcements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Post updates</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            transition={{ delay: index * 0.05 }}
          >
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: stat.color.split('-')[1] }}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resource Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resource Engagement
            </h2>
          </div>
          
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <div className="space-y-4">
              {resourceEngagement.map((resource) => (
                <div key={resource.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{resource.type}</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{
                      resource.type == ''}
                      {resource.count}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(resource.count / 50) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-${resource.color}-500`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Uploads
            </h2>
            
            <Link 
              to="/admin/manage-notes" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          
          <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentUploads.map((upload, idx) => (
                <div
                  key={upload.$id || upload.id || idx}
                  className="p-4"
                  style={{ minHeight: "80px", maxHeight: "80px", overflow: "hidden" }}
                >
                  <div className="flex items-start gap-3 h-full">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white ${
                      upload.type?.toLowerCase() === 'notes' ? 'bg-primary-500' : 
                      upload.type?.toLowerCase() === 'syllabus' ? 'bg-secondary-500' : 
                      upload.type?.toLowerCase() === 'video' ? 'bg-accent-500' : 
                      'bg-success-500'
                    }`}>
                      {upload.type?.toLowerCase() === 'notes' ? <FiBookOpen /> : 
                       upload.type?.toLowerCase() === 'syllabus' ? <FiFileText /> : 
                       upload.type?.toLowerCase() === 'video' ? <FiVideo /> : 
                       <FiFileText />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {upload.title || upload.name || 'Untitled'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={`badge badge-${
                          upload.type?.toLowerCase() === 'notes' ? 'primary' : 
                          upload.type?.toLowerCase() === 'syllabus' ? 'secondary' : 
                          upload.type?.toLowerCase() === 'video' ? 'accent' : 
                          'success'
                        }`}>
                          {upload.type}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">
                          {upload.$createdAt ? new Date(upload.$createdAt).toLocaleDateString() : ''}
                        </span>
                        {/* If you want to show a description, add below with truncate */}
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{upload.description}</p> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 text-center">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  Load more
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Quick Access Cards */}
      
    </div>
  );
};

export default Dashboard;