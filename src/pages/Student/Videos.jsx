import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiVideo } from 'react-icons/fi';
import FilterBar from '../../components/common/FilterBar';
import ContentCard from '../../components/common/ContentCard';
import EmptyState from '../../components/common/EmptyState';
import { fetchVideos } from '../../../src/appwrite'; // Adjust the path as needed

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: 'All',
    year: 'All',
    semester: 'All',
    subject: 'All',
    search: '',
  });
  
  // Fetch videos on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchVideos();
        setVideos(data);
        setFilteredVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    if (videos.length === 0) return;
    
    let filtered = [...videos];
    
    // Apply branch filter
    if (filters.branch && filters.branch !== 'All') {
      filtered = filtered.filter(video => video.branch === filters.branch);
    }
    
    // Apply year filter
    if (filters.year && filters.year !== 'All') {
      filtered = filtered.filter(video => video.year === filters.year);
    }
    
    // Apply semester filter
    if (filters.semester && filters.semester !== 'All') {
      filtered = filtered.filter(video => video.semester === filters.semester);
    }
    
    // Apply subject filter
    if (filters.subject && filters.subject !== 'All') {
      filtered = filtered.filter(video => video.subject === filters.subject);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm) || 
        video.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredVideos(filtered);
  }, [filters, videos]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
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
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Videos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Watch educational videos and lectures
        </p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <EmptyState 
          title="No videos found" 
          description="We couldn't find any videos matching your filters. Try adjusting your search criteria."
          icon={FiVideo}
          action={{
            label: "Clear filters",
            onClick: () => handleFilterChange({
              branch: 'All',
              year: 'All',
              semester: 'All',
              subject: 'All',
              search: '',
            })
          }}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredVideos.map((video) => (
            <motion.div key={video.$id} variants={itemVariants}>
              <ContentCard
                id={video.$id}
                type="videos"
                title={video.title}
                description={video.description}
                thumbnailUrl={video.thumbnailUrl}
                uploadedBy={video.uploadedBy || "Admin"}
                uploadDate={video.$createdAt}
                branch={video.branch}
                subject={video.subject}
                stats={video.stats}
                additionalInfo={{ duration: video.duration }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Videos;