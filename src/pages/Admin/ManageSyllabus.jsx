import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiX, FiTrash, FiEdit, FiUpload, FiCopy, FiSearch } from "react-icons/fi";
import AdminUploadForm from "../../components/common/AdminUploadForm";
import {
  uploadSyllabus,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
  uploadFileToAppwrite,
  storage,
} from "../../../src/appwrite";

const ManageSyllabus = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editSyllabus, setEditSyllabus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [filters, setFilters] = useState({ branch: "All", search: "" });
  const [previewSyllabus, setPreviewSyllabus] = useState(null);

  // Fetch syllabus list from the database
  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const syllabus = await getSyllabus();
      setSyllabusList(syllabus);
    } catch (err) {
      console.error("Error fetching syllabus:", err);
      setError("Failed to fetch syllabus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  // Handle syllabus upload
  const handleUploadComplete = async (newSyllabus) => {
    try {
      // Ensure semester and year are integers if present
      const payload = {
        ...newSyllabus,
        semester: newSyllabus.semester ? parseInt(newSyllabus.semester, 10) : undefined,
        year: newSyllabus.year ? parseInt(newSyllabus.year, 10) : undefined,
      };
      const uploadedSyllabus = await uploadSyllabus(payload);
      setSyllabusList((prev) => [...prev, uploadedSyllabus]);
      setShowUploadForm(false);
    } catch (error) {
      console.error("Error uploading syllabus:", error);
    }
  };

  // Handle syllabus deletion
  const handleDeleteSyllabus = async () => {
    try {
      await deleteSyllabus(deleteId);
      setSyllabusList((prev) => prev.filter((item) => item.$id !== deleteId));
      setSuccessMessage("Syllabus deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting syllabus:", err);
      setError("Failed to delete syllabus");
    } finally {
      setShowConfirmation(false);
      setDeleteId(null);
    }
  };

  // Open confirmation dialog
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirmation(true);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert("Please select a PDF file.");
    }
  };

  // Handle file upload to Appwrite Storage
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploadingFile(true);
    try {
      const response = await uploadFileToAppwrite(selectedFile);
      const url = storage.getFileView(response.bucketId, response.$id);
      setUploadedFileUrl(url);
      setShowFilePopup(true);
    } catch (err) {
      alert("File upload failed!");
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(uploadedFileUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const filteredList = syllabusList.filter(item => {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Manage Syllabus
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage syllabus
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm((prev) => !prev)}
          className="btn btn-primary"
        >
          {showUploadForm ? (
            <FiX className="mr-2" />
          ) : (
            <FiPlus className="mr-2" />
          )}
          {showUploadForm ? "Cancel" : "Upload Syllabus"}
        </button>
      </div>

      {/* Filters */}
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

      {/* PDF Upload Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 justify-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload PDF (optional)
            </label>
            <div className="flex gap-2 sm:flex-row">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="input w-full"
              />
              <button
                type="button"
                className="btn btn-secondary flex items-center gap-2 px-4 py-2 mt-2 sm:mt-0 whitespace-nowrap"
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadingFile}
              >
                <FiUpload />
                {uploadingFile ? "Uploading..." : "Upload"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload a PDF to get a shareable link. Paste the link in the File
              URL while uploading syllabus inside form.
            </p>
          </div>
        </div>
      </div>

      {(showUploadForm || editSyllabus) && (
        <div className="mb-6">
          <AdminUploadForm
            resourceType="syllabus"
            initialData={editSyllabus}
            isEdit={!!editSyllabus}
            onUploadComplete={async (form) => {
              try {
                // Ensure semester and year are integers if present
                const payload = {
                  ...form,
                  semester: form.semester ? parseInt(form.semester, 10) : undefined,
                  year: form.year ? parseInt(form.year, 10) : undefined,
                };
                if (editSyllabus) {
                  // Update existing syllabus
                  await updateSyllabus(editSyllabus.$id, payload);
                  await fetchSyllabus();
                  setSuccessMessage("Syllabus updated successfully!");
                } else {
                  // Create new syllabus
                  const uploadedSyllabus = await uploadSyllabus(payload);
                  setSyllabusList((prev) => [...prev, uploadedSyllabus]);
                  setSuccessMessage("Syllabus uploaded successfully!");
                }
                setTimeout(() => setSuccessMessage(""), 3000);
              } catch (error) {
                setSuccessMessage("Failed to save syllabus.");
                setTimeout(() => setSuccessMessage(""), 3000);
              }
              setEditSyllabus(null);
              setShowUploadForm(false);
            }}
            onCancel={() => setEditSyllabus(null)}
          />
        </div>
      )}

      {/* File Link Popup */}
      {showFilePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 w-[90vw] max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowFilePopup(false)}
            >
              <FiX size={20} />
            </button>
            <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              PDF Uploaded!
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={uploadedFileUrl}
                readOnly
                className="input flex-1"
                onFocus={(e) => e.target.select()}
              />
              <button
                className="btn btn-sm btn-primary flex items-center gap-1"
                onClick={handleCopy}
              >
                <FiCopy />
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Copy and paste this link into the File URL in fileUrl field.
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {successMessage}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading syllabus...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredList.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No syllabus uploaded yet. Use the upload button to add new syllabus
            documents.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((syllabus) => (
              <motion.div
                key={syllabus.$id}
                className="rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-700"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={
                    syllabus.thumbnailUrl || "https://via.placeholder.com/150"
                  }
                  alt={syllabus.title}
                  className="mb-4 h-40 w-full rounded-lg object-cover"
                />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {syllabus.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Branch:</strong> {syllabus.branch}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Semester:</strong> {syllabus.semester}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Year:</strong> {syllabus.year}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setPreviewSyllabus(syllabus)}
                    className="btn bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto transition-all duration-150"
                  >
                    <FiSearch/>
                    Preview
                  </button>
                  <button
                    onClick={() => setEditSyllabus(syllabus)}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto transition-all duration-150"
                  >
                    <FiEdit className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(syllabus.$id)}
                    className="btn bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto transition-all duration-150"
                  >
                    <FiTrash className="mr-1" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this syllabus? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSyllabus}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {previewSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 w-[90vw] max-w-2xl">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setPreviewSyllabus(null)}
            >
              <FiX size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {previewSyllabus.title}
            </h2>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={previewSyllabus.fileUrl}
                title={previewSyllabus.title}
                frameBorder="0"
                className="w-full h-96 rounded"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{previewSyllabus.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSyllabus;
