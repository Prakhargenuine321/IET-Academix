import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import AdminVideoUploadForm from '../../components/common/AdminVideoUploadForm';
import { createVideo, fetchVideos, deleteVideo, updateVideo } from '../../../src/appwrite';

const ManageVideos = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editVideo, setEditVideo] = useState(null); // Holds the video being edited
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [filters, setFilters] = useState({ branch: "All", search: "" });

  const getYoutubeEmbedUrl = (url) => {
    // Extract video ID from various YouTube URL formats
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const data = await fetchVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        setError("Failed to load videos.");
      }
      setLoading(false);
    };
    loadVideos();
  }, []);

  const handleVideoUpload = async (form) => {
    setUploading(true);
    setSuccessMessage('');
    try {
      await createVideo(form);
      setSuccessMessage('Video uploaded successfully!');
      setShowUploadForm(false);
      // Refresh video list
      setLoading(true);
      const data = await fetchVideos();
      setVideos(data);
      setError(null);
      setLoading(false);
      // Optionally, hide the message after a few seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError("Failed to upload video.");
    }
    setUploading(false);
  };

  const handleVideoEdit = async (form) => {
    setUploading(true);
    setSuccessMessage('');
    try {
      await updateVideo(editVideo.$id, form); // You need to implement updateVideo in appwrite.js
      setSuccessMessage('Video updated successfully!');
      setEditVideo(null);
      // Refresh video list
      setLoading(true);
      const data = await fetchVideos();
      setVideos(data);
      setError(null);
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError("Failed to update video.");
    }
    setUploading(false);
  };

  const handleDelete = async (videoId) => {
    setDeletingId(videoId);
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.$id !== videoId));
    } catch {
      setError("Failed to delete video.");
    }
    setDeletingId(null);
  };

  const filteredList = videos.filter(item => {
    const branchMatch = filters.branch === "All" || item.branch === filters.branch;
    const searchMatch =
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filters.search.toLowerCase()));
    return branchMatch && searchMatch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Manage Videos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage educational videos
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(prev => !prev)}
          className="btn btn-primary"
        >
          {showUploadForm ? <FiX className="mr-2" /> : <FiPlus className="mr-2" />}
          {showUploadForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-6">
          <div className="w-full sm:w-48">
            <select
              name="branch"
              value={filters.branch}
              onChange={e => setFilters(prev => ({ ...prev, branch: e.target.value }))}
              className="input"
            >
              {["All", "Computer Science", "Electronics Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search..."
                className="input pl-3"
              />
            </div>
          </div>
        </div>
      </div>
      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-center">
          {successMessage}
        </div>
      )}
      {(showUploadForm || editVideo) && (
        <div className="mb-6">
          <AdminVideoUploadForm
            onSubmit={editVideo ? handleVideoEdit : handleVideoUpload}
            loading={uploading}
            initialData={editVideo}
            isEdit={!!editVideo}
            onCancel={() => setEditVideo(null)}
          />
        </div>
      )}
      {/* ...rest of your video list code remains unchanged... */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading videos...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredList.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No videos found. Use the upload button to add new educational videos.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredList.map(video => (
              <motion.div
                key={video.$id}
                className="rounded-lg border p-0 shadow-sm dark:bg-gray-900 flex flex-col"
                whileHover={{ scale: 1.02 }}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnailUrl || "https://via.placeholder.com/400x200?text=No+Thumbnail"}
                  alt={video.title}
                  className="rounded-t-lg w-full h-40 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{video.description}</p>
                  <p className="text-xs text-gray-500 mb-2">Uploaded by: Admin</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                    <span>Branch: {video.branch}</span>
                    <span>Year: {video.year}</span>
                    <span>Semester: {video.semester}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => setActiveVideo(video)}
                    >
                      <span role="img" aria-label="Notes">📝</span> Preview
                    </button>
                    <button
                      className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => setEditVideo(video)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => {
                        setVideoToDelete(video.$id);
                        setShowConfirmation(true);
                      }}
                      disabled={deletingId === video.$id}
                    >
                      {deletingId === video.$id ? <span className="animate-spin">⏳</span> : "Delete"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {activeVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              onClick={() => setActiveVideo(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{activeVideo.title}</h2>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={getYoutubeEmbedUrl(activeVideo.fileUrl)}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-72 rounded"
              ></iframe>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{activeVideo.description}</p>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  setShowConfirmation(false);
                  setVideoToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={async () => {
                  setShowConfirmation(false);
                  setDeletingId(videoToDelete);
                  try {
                    await deleteVideo(videoToDelete);
                    setVideos(videos.filter(v => v.$id !== videoToDelete));
                    setSuccessMessage('Video deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  } catch {
                    setError("Failed to delete video.");
                  }
                  setDeletingId(null);
                  setVideoToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVideos;