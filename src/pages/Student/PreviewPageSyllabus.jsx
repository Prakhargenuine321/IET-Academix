import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import ChatAI from '../../components/common/ChatAI';
import { getSyllabusById } from '../../../src/appwrite'; // Ensure this function fetches syllabus data correctly
import YouTube from 'react-youtube';

// Utility to detect mobile device
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const PreviewPageSyllabus = () => {
  const { id } = useParams(); // Use only `id` since this is specific to syllabus
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const doc = await getSyllabusById(id); // Fetch syllabus data using the `id`

        if (!doc || doc === null) {
          throw new Error('No syllabus found');
        }

        setResource(doc);
      } catch (err) {
        console.error('Error fetching syllabus:', err);
        setError(err.message || 'Failed to load syllabus');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (!resource) return <div>Loading...</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = () => {
    if (!resource) return;
    alert(`Download started for ${resource.title}`);
    try {
      // await updateResourceStats('syllabus', id, 'download'); // Uncomment if stats update is implemented
    } catch (error) {
      console.error('Error updating download stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {error || 'Syllabus not found'}
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          We couldn't load the requested syllabus. Please try again later.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          <FiArrowLeft className="mr-2" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          Syllabus
        </h1>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl">
              {resource.title}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {resource.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FiUser className="mr-1" />
                {resource.uploadedBy}
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="mr-1" />
                {formatDate(resource.uploadDate)}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge badge-primary">{resource.branch}</span>
              {resource.year && <span className="badge badge-accent">Year {resource.year}</span>}
              {resource.semester && <span className="badge badge-success">Semester {resource.semester}</span>}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="btn btn-primary self-start whitespace-nowrap"
          >
            <FiDownload className="mr-2" />
            Download
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100%-230px)] flex-col gap-6 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-1/2 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800 lg:h-full lg:w-3/5"
        >
          <div className="flex h-full flex-col items-center justify-center p-4">
            <div className="w-full max-w-full h-96 overflow-auto rounded-lg border bg-black/80 flex items-center justify-center">
              {resource.fileUrl ? (
                isMobile() ? (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    📄 View PDF
                  </a>
                ) : (
                  <iframe
                    src={resource.fileUrl}
                    title="PDF Preview"
                    className="w-full"
                    style={{
                      minHeight: 350,
                      background: "#222",
                      border: 'none',
                      borderRadius: '0 0 0.75rem 0.75rem',
                    }}
                  />
                )
              ) : (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  PDF preview is not available. No file URL provided.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-1/2 lg:h-full lg:w-2/5"
        >
          <ChatAI type="ai" />
        </motion.div>
      </div>
    </div>
  );
};

export default PreviewPageSyllabus;
