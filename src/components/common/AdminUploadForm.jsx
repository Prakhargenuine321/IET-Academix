import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiLink, FiFile } from "react-icons/fi";
import {FaLaptop} from "react-icons/fa"
 
const AdminUploadForm = ({ resourceType, onUploadComplete, initialData, isEdit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    branch: "Computer Science",
    year: "1",
    semester: "1",
    subject: "",
    fileUrl: "",
    videoUrl: "",
    thumbnailUrl: "",
    uploadedBy: "Admin",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        branch: initialData.branch || "Computer Science",
        year: initialData.year || "1",
        semester: initialData.semester || "1",
        subject: initialData.subject || "",
        fileUrl: initialData.fileUrl || "",
        videoUrl: initialData.videoUrl || "",
        thumbnailUrl: initialData.thumbnailUrl || "",
        uploadedBy: initialData.uploadedBy || "Admin",
      });
    }
  }, [initialData]);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Options for selects
  const branchOptions = [
    "Computer Science",
    "Electrical Engineering",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
  ];
  const yearOptions = ["1", "2", "3", "4", "All"];
  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8","All"];
  const subjectOptions = [
    "Data Structures",
    "DBMS",
    "Networks",
    "Operating Systems",
    "Machine Learning",
    "Power Electronics",
    "Natural Language Processing"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.fileUrl.trim()) {
      setError("File URL is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    if (!validateForm()) return;

    setIsUploading(true);
    setError(null);

    try {
      const syllabusData = {
        title: formData.title,
        branch: formData.branch,
        semester: formData.semester,
        year: formData.year,
        subject: formData.subject,
        description: formData.description,
        fileUrl: formData.fileUrl,
        thumbnailUrl:
          formData.thumbnailUrl || "https://via.placeholder.com/150",
      };

      await onUploadComplete(syllabusData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "An error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
    >
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Upload{" "}
        {resourceType === "pyqs"
          ? "PYQs"
          : resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
      </h2>

      {success && (
        <div className="mb-4 rounded-lg bg-success-100 p-3 text-success-800 dark:bg-success-900/30 dark:text-success-300">
          Upload successful!
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-error-100 p-3 text-error-800 dark:bg-error-900/30 dark:text-error-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter title"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[100px]"
              placeholder="Enter description"
              required
            ></textarea>
          </div>

          {/* Branch */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Branch*
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="input"
              required
            >
              {branchOptions.map((option) => (
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
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((option) => (
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
              name="year"
              value={formData.year}
              onChange={handleChange}
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
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="input"
            >
              {semesterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* File URL */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {resourceType === "videos" ? "YouTube Video URL*" : "File URL*"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {resourceType === "videos" ? (
                  <FaLaptop className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <FiFile className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <input
                type="text"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                className="input pl-10"
                placeholder={
                  resourceType === "videos"
                    ? "Enter YouTube video URL"
                    : "Enter file URL"
                }
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {resourceType === "videos"
                ? "Enter a valid YouTube video URL."
                : "Enter a valid URL to the PDF file."}
            </p>
          </div>

          {/* Thumbnail URL */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Thumbnail URL
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiLink className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="input pl-10"
                placeholder="Enter thumbnail URL (optional)"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If not provided, a default thumbnail will be used.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="btn btn-primary"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminUploadForm;
