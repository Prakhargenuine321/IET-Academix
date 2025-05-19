import { useState, useEffect } from "react";
import { FiPlus, FiX, FiUpload } from "react-icons/fi";
import AdminPYQUpload from "../../components/common/AdminPYQUpload";
import {
  createPYQ,
  fetchPYQs,
  deletePYQ,
  updatePYQ,
  uploadFileToAppwrite,
  storage,
} from "../../../src/appwrite";

const ManagePYQs = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pyqs, setPYQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePYQ, setActivePYQ] = useState(null);
  const [editPYQ, setEditPYQ] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pyqToDelete, setPyqToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filePopupUrl, setFilePopupUrl] = useState("");
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [filters, setFilters] = useState({ branch: "All", search: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch PYQs on mount
  useEffect(() => {
    const loadPYQs = async () => {
      setLoading(true);
      const data = await fetchPYQs();
      setPYQs(data);
      setLoading(false);
    };
    loadPYQs();
  }, []);

  const handlePYQUpload = async (form) => {
    setUploading(true);
    try {
      await createPYQ(form);
      setShowUploadForm(false);
      const data = await fetchPYQs();
      setPYQs(data);
      setSuccessMessage("PYQ created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setSuccessMessage("Failed to upload PYQ.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setUploading(false);
  };

  const handlePYQEdit = async (form) => {
    setUploading(true);
    try {
      await updatePYQ(editPYQ.$id, form);
      setEditPYQ(null);
      setShowUploadForm(false);
      const data = await fetchPYQs();
      setPYQs(data);
      setSuccessMessage("PYQ updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setSuccessMessage("Failed to update PYQ.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setUploading(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await storage.createFile(
        "YOUR_BUCKET_ID", // Replace with your bucket ID
        ID.unique(),
        file
      );
      const fileUrl = storage.getFileView("YOUR_BUCKET_ID", uploaded.$id).href;
      setFilePopupUrl(fileUrl);
      setShowFilePopup(true);
    } catch (err) {
      setSuccessMessage("Failed to upload file.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setUploading(false);
  };

  const filteredList = pyqs.filter((item) => {
    const branchMatch =
      filters.branch === "All" || item.branch === filters.branch;
    const searchMatch =
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(filters.search.toLowerCase()));
    return branchMatch && searchMatch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Manage PYQs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage previous year questions
          </p>
        </div>
        <button
          onClick={() => {
            setShowUploadForm((prev) => !prev);
            setEditPYQ(null);
          }}
          className="btn btn-primary"
        >
          {showUploadForm ? (
            <FiX className="mr-2" />
          ) : (
            <FiPlus className="mr-2" />
          )}
          {showUploadForm ? "Cancel" : "Upload PYQ"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-6">
          <div className="w-full sm:w-48">
            <select
              name="branch"
              value={filters.branch}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, branch: e.target.value }))
              }
              className="input"
            >
              {[
                "All",
                "Computer Science",
                "Electronics Engineering",
                "Electrical Engineering",
                "Mechanical Engineering",
                "Civil Engineering",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search..."
                className="input pl-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* File upload input is always visible */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
          Upload PYQ File (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            className="input w-full"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            disabled={uploading}
          />
          <button
            className="btn bg-purple-600 hover:bg-purple-700 text-white"
            type="button"
            disabled={uploading || !selectedFile}
            onClick={() => handleFileUpload(selectedFile)}
          >
            Upload
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Upload a file to get a shareable link. Paste the link in the File URL field inside the form below.
        </p>
      </div>

      {(showUploadForm || editPYQ) && (
        <div className="mb-6">
          <AdminPYQUpload
            onSubmit={editPYQ ? handlePYQEdit : handlePYQUpload}
            loading={uploading}
            initialData={editPYQ}
            isEdit={!!editPYQ}
            onCancel={() => {
              setEditPYQ(null);
              setShowUploadForm(false);
            }}
            onFileUpload={handleFileUpload}
          />
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading PYQs...
          </p>
        ) : pyqs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Use the upload button to add new previous year question papers.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((item) => (
              <div
                key={item.$id}
                className="rounded-lg border p-0 shadow-sm dark:bg-gray-900 flex flex-col"
              >
                <img
                  src={
                    item.thumbnailUrl ||
                    "https://via.placeholder.com/400x200?text=No+Thumbnail"
                  }
                  alt={item.title}
                  className="rounded-t-lg w-full h-40 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Uploaded by: Admin
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                    <span>Branch: {item.branch}</span>
                    <span>Year: {item.year}</span>
                    <span>Semester: {item.semester}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => setActivePYQ(item)}
                    >
                      <span role="img" aria-label="Notes">
                        📝
                      </span>
                      Preview
                    </button>
                    <button
                      className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => {
                        setEditPYQ(item);
                        setShowUploadForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded flex-1"
                      onClick={() => {
                        setPyqToDelete(item);
                        setShowConfirmation(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {activePYQ && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              onClick={() => setActivePYQ(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{activePYQ.title}</h2>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={activePYQ.fileUrl}
                title={activePYQ.title}
                frameBorder="0"
                className="w-full h-96 rounded"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {activePYQ.description}
            </p>
          </div>
        </div>
      )}
      {showConfirmation && pyqToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this PYQ? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  setShowConfirmation(false);
                  setPyqToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={async () => {
                  setUploading(true);
                  try {
                    await deletePYQ(pyqToDelete.$id);
                    setSuccessMessage("PYQ deleted successfully!");
                    setPYQs(pyqs.filter((p) => p.$id !== pyqToDelete.$id));
                    setTimeout(() => setSuccessMessage(""), 3000);
                  } catch {
                    setSuccessMessage("Failed to delete PYQ.");
                    setTimeout(() => setSuccessMessage(""), 3000);
                  }
                  setUploading(false);
                  setShowConfirmation(false);
                  setPyqToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
      {showFilePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              onClick={() => setShowFilePopup(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">File Uploaded!</h2>
            <div className="mb-4">
              <input
                type="text"
                value={filePopupUrl}
                readOnly
                className="input w-full"
              />
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                navigator.clipboard.writeText(filePopupUrl);
                setCopySuccess("Copied!");
                setTimeout(() => setCopySuccess(""), 1500);
              }}
            >
              Copy Link
            </button>
            {copySuccess && (
              <div className="text-green-600 text-center mt-2">
                {copySuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePYQs;
