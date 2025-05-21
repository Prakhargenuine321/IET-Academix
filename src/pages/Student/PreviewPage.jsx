import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import ChatAI from '../../components/common/ChatAI';
import { getResources, fetchVideos, fetchPYQs } from '../../../src/appwrite';
import YouTube from 'react-youtube';

// Utility to detect mobile device
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const PreviewPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        if (type === 'videos') {
          const allVideos = await fetchVideos();
          const doc = allVideos.find(v => v.$id === id);
          if (!doc) throw new Error('No video found');
          setResource(doc);
        } else if (type === 'pyqs') {
          const allPYQs = await fetchPYQs();
          const doc = allPYQs.find(p => p.$id === id);
          if (!doc) throw new Error('No PYQ found');
          setResource(doc);
        } else {
          const doc = await getResources(type, id);
          if (!doc) throw new Error('No resource found');
          setResource(doc);
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError(err.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [type, id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleDownload = () => {
    if (!resource?.fileUrl) return;
    const link = document.createElement('a');
    link.href = resource.fileUrl;
    link.setAttribute('download', ''); // Let browser handle the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Your file started downloading");
    setTimeout(() => setSuccessMessage(""), 3000);
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
          {error || 'Resource not found'}
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          We couldn't load the requested resource. Please try again later.
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
          {type === 'notes' ? 'Notes' :
            type === 'syllabus' ? 'Syllabus' :
              type === 'videos' ? 'Video' :
                type === 'pyqs' ? 'Previous Year Questions' : 'Resource'}
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
              {resource.subject && <span className="badge badge-secondary">{resource.subject}</span>}
              {resource.year && <span className="badge badge-accent">Year {resource.year}</span>}
              {resource.semester && <span className="badge badge-success">Semester {resource.semester}</span>}
            </div>

            {type === 'videos' && resource.playlistUrl && (
              <a
                href={resource.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-blue-600 hover:underline"
              >
                View Full Playlist
              </a>
            )}
          </div>

          {type !== 'videos' && (
            <button
              onClick={handleDownload}
              className="btn btn-primary self-start whitespace-nowrap"
            >
              <FiDownload className="mr-2" />
              Download
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      <div className="flex h-[calc(100%-230px)] flex-col gap-6 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-1/2 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800 lg:h-full lg:w-3/5"
        >
          {type === 'videos' ? (
            <div className="flex h-full w-full items-center justify-center bg-black">
              <YouTube
                videoId={getYouTubeId(resource.fileUrl)}
                opts={{
                  height: '100%',
                  width: '100%',
                  playerVars: { autoplay: 0 },
                }}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col p-0 md:p-4">
              {/* PDF Preview Area */}
              <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-b-lg flex items-center justify-center">
                {isMobile() ? (
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
                    title={resource.title}
                    className="w-full"
                    style={{
                      minHeight: 400,
                      height: '70vh',
                      border: 'none',
                      borderRadius: '0 0 0.75rem 0.75rem',
                    }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          )}
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

export default PreviewPage;
