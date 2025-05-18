import { useState } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FilterBar = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    branch: 'All',
    year: 'All',
    semester: 'All',
    subject: 'All',
    search: '',
  });
  
  // Filter options
  const branchOptions = ['All', 'Computer Science','Electronics Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
  const yearOptions = ['All', '1', '2', '3', '4'];
  const semesterOptions = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const subjectOptions = ['All', 'Data Structures', 'DBMS', 'Networks', 'Operating Systems', 'Machine Learning'];
  
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  const resetFilters = () => {
    const resetValues = {
      branch: 'All',
      year: 'All',
      semester: 'All',
      subject: 'All',
      search: '',
    };
    setFilters(resetValues);
    onFilterChange(resetValues);
  };
  
  return (
    <div className="mb-6 w-full rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
      {/* Search and filter toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search resources..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="ml-2 hidden btn btn-primary sm:flex">
            Search
          </button>
        </form>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-600"
        >
          <FiFilter />
          <span className="hidden sm:inline">Filters</span>
          <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Expandable filter options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            <div className="grid gap-4 border-t border-gray-200 pt-3 dark:border-gray-700 sm:grid-cols-2 md:grid-cols-4">
              {/* Branch */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Branch
                </label>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="input"
                >
                  {branchOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Year */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="input"
                >
                  {yearOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Semester */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Semester
                </label>
                <select
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  className="input"
                >
                  {semesterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Subject */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="input"
                >
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FiX size={14} />
                Reset filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;