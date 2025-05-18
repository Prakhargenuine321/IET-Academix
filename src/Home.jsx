import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaQuestion, FaUsers, FaMoon, FaDownload, FaGraduationCap, FaChalkboardTeacher, FaLaptop } from 'react-icons/fa';
import Navbar from '../src/components/common/Navbar2';
import Footer from '../src/components/common/Footer';
import { getCurrentUser } from '../src/appwrite';

const Home = () => {
  const navigate = useNavigate();

  // Function to handle "Get Started" button click
  const handleGetStarted = async () => {
    const user = await getCurrentUser();
    if (user) {
      // Assuming you store role in user labels (Appwrite 1.x) or prefs (Appwrite 0.x)
      // For labels: user.labels is an array, for prefs: user.prefs.role
      let role = null;
      if (user.labels && user.labels.length > 0) {
        // Appwrite 1.x
        if (user.labels.includes('student')) role = 'student';
        else if (user.labels.includes('teacher')) role = 'teacher';
        else if (user.labels.includes('admin')) role = 'admin';
      } else if (user.prefs && user.prefs.role) {
        // Appwrite 0.x
        role = user.prefs.role;
      }

      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // fallback if no role
        navigate('/login');
      }
    } else {
      // If no active session, redirect to login
      navigate('/login');
    }
  };
  

  const features = [
    {
      icon: FaBook,
      title: 'Comprehensive Study Materials',
      description: 'Access a vast library of well-organized notes and study materials for all subjects',
    },
    {
      icon: FaQuestion,
      title: 'Previous Year Papers',
      description: 'Practice with a collection of previous year questions to enhance your exam preparation',
    },
    {
      icon: FaUsers,
      title: 'Interactive Community',
      description: 'Connect with fellow students and teachers through our engaging community platform',
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Expert Teachers',
      description: 'Learn from experienced educators who provide guidance and support',
    },
    {
      icon: FaLaptop,
      title: 'Video Lectures',
      description: 'Watch high-quality video lectures to better understand complex topics',
    },
    {
      icon: FaDownload,
      title: 'Easy Downloads',
      description: 'Download study materials for offline access anytime, anywhere',
    },
  ];

  const featuresToShow = [
    {
      title: "AI Doubt Solver 🤖.",
    },
    {
      title: "Notes by Toppers 📚.",
    
    },
    {
      title: "PYQs Archive 📄.",
    },
    {
      title: "Mentorship 🧑‍🏫.",
    },
    {
      title: "Community Help 💬.",
    },
    {
      title: "Practical Writing 🧪.",
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/30 relative">
        <Navbar/>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Centralized Resources. Instant Guidance.{' '}
              <span className="text-primary-600">Enhanced by AI.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Your comprehensive educational platform designed to enhance learning through
              collaboration, quality resources, and innovative technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGetStarted} // Call the function on button click
                className="inline-block backdrop-blur-md bg-primary-600/80 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700/80 transition-colors"
              >
                Get Started
              </button>
              <Link
                to="/about"
                className="inline-block bg-gray-400/50 dark:bg-gray-700/60 text-gray-700 dark:text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="dark:bg-gradient-to-br 
                from-[#1e2a47] via-[#2c3c5e] to-[#1e2a47] 
                dark:from-[#121d31] dark:via-[#1b2a45] dark:to-[#121d31] 
                backdrop-blur-md 
                bg-white/10 
                shadow-2xl shadow-black/40 
                py-12 px-4 sm:px-6 lg:px-8 
                overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          You will love for sure 💖
        </h2>

        <motion.div
          className="flex space-x-10 animate-scroll whitespace-nowrap mt-16"
          initial={{ x: "-10%" }}
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40
          }}
        >
          {[...featuresToShow, ...featuresToShow].map((item, idx) => (
            <div
            key={idx}
            className="flex-shrink-0 w-60 text-wrap backdrop-blur-lg bg-white/10 dark:bg-gray-800/30 p-4 rounded-2xl border border-white/20 dark:border-gray-700 shadow-[0_4px_30px_rgba(34,197,94,0.3)]"
          >          
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              {/* <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p> */}
            </div>
          ))}
        </motion.div>
      </div>
    </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover the tools and resources designed to support your academic success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow h-64 border dark:border-blue-900 dark:shadow-md dark:backdrop-blur-lg"
            >
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-3 inline-block mb-4">
                <feature.icon className="text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-400 dark:bg-primary-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              Ready to Transform Your Learning Experience?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Join Now
              </Link>
              <Link
                to="/login"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;