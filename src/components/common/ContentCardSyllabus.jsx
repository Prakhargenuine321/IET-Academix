import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import PreviewPageSyllabus from '../../pages/Student/PreviewPageSyllabus';

const ContentCardSyllabus = ({
  id,
  title,
  description,
  thumbnailUrl,
  branch,
  semester,
  year,
  uploadedBy,
  uploadDate,
}) => {
  const formattedDate = new Date(uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="h-full overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 border-b-4  dark:border-b-sky-600 dark:hover:border-b-sky-400"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={thumbnailUrl || 'https://via.placeholder.com/150'}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 flex w-full justify-between p-3">
          <span className="badge badge-primary">{branch}</span>
          {semester && <span className="badge badge-secondary">Sem {semester}</span>}
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Year: {year}</span>
        </div>
        <Link
          to={`/student/preview/syllabus/${id}`}
          className="block w-full p-3 bg-blue-500 hover:bg-blue-600 mt-4 rounded-lg text-white text-center transition-all duration-150"
        >
          View Syllabus
        </Link>
      </div>
    </motion.div>
  );
};

export default ContentCardSyllabus;