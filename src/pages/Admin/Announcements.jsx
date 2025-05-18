import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash, FiEdit, FiBell } from 'react-icons/fi';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from "../../../src/appwrite";

const ConfirmModal = ({ open, onConfirm, onCancel }) => (
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Delete Announcement</h2>
        <p className="mb-6">Are you sure you want to delete this announcement?</p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-error" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  ) : null
);

const Popup = ({ show, message, type }) => (
  show ? (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
    </div>
  ) : null
);

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: ['all'],
    priority: 'medium'
  });
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const getAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    getAnnouncements();
  }, []);

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAnnouncement = {
      ...formData,
      target: Array.isArray(formData.target) ? formData.target : [formData.target],
      createdAt: new Date().toISOString()
    };

    try {
      await createAnnouncement(newAnnouncement);
      setPopup({ show: true, message: "Announcement created!", type: "success" });
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        target: ['all'],
        priority: 'medium'
      });
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Create error:", error);
      setPopup({ show: true, message: "Failed to create announcement.", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAnnouncement(deleteId);
      setPopup({ show: true, message: "Announcement deleted!", type: "success" });
      setDeleteId(null);
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Delete error:", error);
      setPopup({ show: true, message: "Failed to delete announcement.", type: "error" });
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <ConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Popup show={popup.show} message={popup.message} type={popup.type} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and post announcements for students and teachers
          </p>
        </div>

        <button
          onClick={() => setShowForm(prev => !prev)}
          className="btn btn-primary"
        >
          {showForm ? <FiPlus className="mr-2" /> : <FiBell className="mr-2" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Create New Announcement
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="input min-h-[100px]"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Audience
              </label>
              <select
                value={formData.target[0]}
                onChange={e => setFormData(prev => ({ ...prev, target: [e.target.value] }))}
                className="input"
              >
                <option value="all">All Users</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Post Announcement
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {announcement.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`badge ${
                    announcement.priority === 'high' ? 'badge-error' :
                    announcement.priority === 'medium' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
                  </span>
                  <span className="badge badge-secondary">
                    {announcement.target?.[0] ?? 'all'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Posted on {formatDate(announcement.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Edit"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(announcement.$id)}
                  className="rounded-full p-1.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/30"
                  title="Delete"
                >
                  <FiTrash size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400">
              {announcement.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
