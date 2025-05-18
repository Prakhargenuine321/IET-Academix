import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
//import { FiFileQuestion } from 'react-icons/fi';
import { FiHelpCircle } from 'react-icons/fi';
import FilterBar from '../../components/common/FilterBar';
import ContentCard from '../../components/common/ContentCard';
import EmptyState from '../../components/common/EmptyState';
import { fetchPYQs } from '../../../src/appwrite'; // Adjust the path if needed


const PYQs = () => {
  const [pyqs, setPyqs] = useState([]);
  const [filteredPyqs, setFilteredPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: 'All',
    year: 'All',
    semester: 'All',
    subject: 'All',
    search: '',
  });
  
  // Fetch PYQs on component mount
  useEffect(() => {
    const fetchPyqs = async () => {
      try {
        setLoading(true);
        const data = await fetchPYQs();
        setPyqs(data);
        setFilteredPyqs(data);
      } catch (error) {
        console.error('Error fetching PYQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPyqs();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    if (pyqs.length === 0) return;
    
    let filtered = [...pyqs];
    
    // Apply branch filter
    if (filters.branch && filters.branch !== 'All') {
      filtered = filtered.filter(pyq => pyq.branch === filters.branch);
    }
    
    // Apply year filter
    if (filters.year && filters.year !== 'All') {
      filtered = filtered.filter(pyq => pyq.year === filters.year);
    }
    
    // Apply semester filter
    if (filters.semester && filters.semester !== 'All') {
      filtered = filtered.filter(pyq => pyq.semester === filters.semester);
    }
    
    // Apply subject filter
    if (filters.subject && filters.subject !== 'All') {
      filtered = filtered.filter(pyq => pyq.subject === filters.subject);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(pyq => 
        pyq.title.toLowerCase().includes(searchTerm) || 
        pyq.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredPyqs(filtered);
  }, [filters, pyqs]);
  
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Previous Year Questions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access previous year exam questions
        </p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
        </div>
      ) : filteredPyqs.length === 0 ? (
        <EmptyState 
          title="No PYQs found" 
          description="We couldn't find any previous year questions matching your filters. Try adjusting your search criteria."
          icon={FiHelpCircle}
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
          {filteredPyqs.map((pyq) => (
            <motion.div key={pyq.$id} variants={itemVariants}>
              <ContentCard
                id={pyq.$id}
                type="pyqs"
                title={pyq.title}
                description={pyq.description}
                thumbnailUrl={pyq.thumbnailUrl}
                uploadedBy={pyq.uploadedBy || "Admin"}
                uploadDate={pyq.$createdAt}
                branch={pyq.branch}
                subject={pyq.subject}
                stats={pyq.stats}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PYQs;