import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiEye, FiThumbsUp, FiBookmark, FiClock } from 'react-icons/fi';
import { updateNoteStats } from '../../../src/appwrite'; // Function to update stats in the database

const ContentCard = ({ 
  id, 
  type, 
  title, 
  description, 
  thumbnailUrl, 
  uploadedBy, 
  uploadDate, 
  branch, 
  subject, 
  likes,
  views,
  downloads,
  bookmarks,
  additionalInfo,
  currentUser // Pass the current user as a prop
}) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [statData, setStatData] = useState({ likes, views, downloads, bookmarks, viewedBy: [], downloadedBy: [] });

  const formattedDate = new Date(uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const updatedLikes = liked ? statData.likes - 1 : statData.likes + 1;

      setLiked(!liked);
      setStatData((prev) => ({
        ...prev,
        likes: updatedLikes,
      }));

      await updateNoteStats(id, {
        likes: updatedLikes,
        likedBy: liked ? "remove" : "add", // Pass action to update likedBy list
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      setLiked(!liked); // Revert state on error
      setStatData((prev) => ({
        ...prev,
        likes: liked ? prev.likes + 1 : prev.likes - 1,
      }));
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setBookmarked(!bookmarked);
    setStatData((prev) => ({
      ...prev,
      bookmarks: bookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1,
    }));

    try {
      await updateNoteStats(id, { bookmarks: bookmarked ? statData.bookmarks - 1 : statData.bookmarks + 1 });
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      setBookmarked(!bookmarked);
      setStatData((prev) => ({
        ...prev,
        bookmarks: bookmarked ? prev.bookmarks + 1 : prev.bookmarks - 1,
      }));
    }
  };

  const handleView = async () => {
    try {
      if (!statData.viewedBy.includes(currentUser.id)) {
        setStatData((prev) => ({
          ...prev,
          views: prev.views + 1,
          viewedBy: [...prev.viewedBy, currentUser.id],
        }));

        await updateNoteStats(id, {
          views: statData.views + 1,
          viewedBy: [...statData.viewedBy, currentUser.id],
        });
      }
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!statData.downloadedBy.includes(currentUser.id)) {
        setStatData((prev) => ({
          ...prev,
          downloads: prev.downloads + 1,
          downloadedBy: [...prev.downloadedBy, currentUser.id],
        }));

        await updateNoteStats(id, {
          downloads: statData.downloads + 1,
          downloadedBy: [...statData.downloadedBy, currentUser.id],
        });

        alert("Download started");
      }
    } catch (error) {
      console.error("Error updating downloads:", error);
    }
  };

  return (
    <Link to={`/student/preview/${type}/${id}`} onClick={handleView}>
      <motion.div
        whileHover={{ y: -5 }}
        className="h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 border-b-4  dark:border-b-sky-600 dark:hover:border-b-sky-400"
      >
        <div className="relative h-40 overflow-hidden">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 flex w-full justify-between p-3">
            <span className="badge badge-primary">{branch}</span>
            {subject && <span className="badge badge-secondary">{subject}</span>}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            {description.length > 100
              ? `${description.slice(0, 100)}...`
              : description}
          </p>

          {type === 'videos' && additionalInfo?.duration && (
            <div className="mb-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <FiClock className="mr-1" />
              {additionalInfo.duration}
            </div>
          )}

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Footer fixed at bottom */}
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{uploadedBy}</span>
              <span className="flex items-center">
                <FiClock className="mr-1" />
                {formattedDate}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
              <div className="flex gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1 text-xs ${
                    liked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FiThumbsUp />
                  <span>{statData.likes}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <FiEye />
                  <span>{statData.views}</span>
                </div>

                {statData.downloads !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <FiDownload />
                    <span>{statData.downloads}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBookmark}
                  className={`rounded-full p-1.5 ${
                    bookmarked 
                      ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Bookmark"
                >
                  <FiBookmark size={14} />
                </button>

                {type !== 'videos' && (
                  <button
                    onClick={handleDownload}
                    className="rounded-full bg-primary-100 p-1.5 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-800/50"
                    aria-label="Download"
                  >
                    <FiDownload size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ContentCard;
