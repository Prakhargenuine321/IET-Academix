import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';
import FilterBar from '../../components/common/FilterBar';
import EmptyState from '../../components/common/EmptyState';
import ContentCardSyllabus from '../../components/common/ContentCardSyllabus';
import { getSyllabus } from '../../../src/appwrite';

const Syllabus = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [filteredSyllabus, setFilteredSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: 'All',
    year: 'All',
    semester: 'All',
    search: '',
  });

  // Fetch syllabus data from Appwrite
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true);
        const data = await getSyllabus('syllabus'); // Fetch syllabus data from Appwrite
        console.log('Fetched Syllabus:', data); // Debugging
        setSyllabus(data);
        setFilteredSyllabus(data); // Initialize filtered syllabus
      } catch (error) {
        console.error('Error fetching syllabus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    if (syllabus.length === 0) return;

    console.log('Filters:', filters); // Debugging
    console.log('Original Syllabus:', syllabus); // Debugging

    let filtered = [...syllabus];

    // Apply branch filter
    if (filters.branch && filters.branch !== 'All') {
      filtered = filtered.filter(
        (data) => String(data.branch).toLowerCase() === String(filters.branch).toLowerCase()
      );
    }

    // Apply year filter
    if (filters.year && filters.year !== 'All') {
      filtered = filtered.filter(
        (data) => String(data.year) === String(filters.year)
      );
    }

    // Apply semester filter
    if (filters.semester && filters.semester !== 'All') {
      filtered = filtered.filter(
        (data) => String(data.semester) === String(filters.semester)
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (data) =>
          data.title.toLowerCase().includes(searchTerm) ||
          data.description.toLowerCase().includes(searchTerm)
      );
    }

    console.log('Filtered Syllabus:', filtered); // Debugging
    setFilteredSyllabus(filtered);
  }, [filters, syllabus]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    console.log('New Filters:', newFilters); // Debugging
    setFilters(newFilters);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const dataVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Syllabus</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access curriculum syllabus for all courses
        </p>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex h-60 datas-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
        </div>
      ) : filteredSyllabus.length === 0 ? (
        <EmptyState
          title="No syllabus found"
          description="We couldn't find any syllabus matching your filters. Try adjusting your search criteria."
          icon={FiFileText}
          action={{
            label: 'Clear filters',
            onClick: () =>
              handleFilterChange({
                branch: 'All',
                year: 'All',
                semester: 'All',
                search: '',
              }),
          }}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredSyllabus.map((data) => (
            <motion.div key={data.$id} variants={dataVariants}>
              <ContentCardSyllabus
                id={data.$id}
                title={data.title}
                description={data.description}
                thumbnailUrl={data.thumbnailUrl}
                branch={data.branch}
                semester={data.semester}
                year={data.year}
                uploadedBy={data.uploadedBy}
                uploadDate={data.uploadDate}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Syllabus;