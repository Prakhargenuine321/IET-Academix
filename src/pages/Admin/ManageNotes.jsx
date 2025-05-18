import React, { useEffect, useState } from "react";
import {
  FiX,
  FiFilter,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash,
  FiUpload,
  FiCopy,
} from "react-icons/fi";
import {
  getResources,
  createNote,
  updateNote,
  deleteNote,
  uploadFileToAppwrite,
  storage,
} from "../../../src/appwrite";

const branchOptions = [
  "Computer Science",
  "Electronics Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "All",
];

const ManageNotes = () => {
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState({ show: false, data: null });
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [filters, setFilters] = useState({ branch: "All", search: "" });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    noteId: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);

  const fetchNotes = async () => {
    const data = await getResources("notes");
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (newNote) => {
    try {
      await createNote(newNote);
      setSuccessMessage("Note created successfully!");
      fetchNotes();
      setCreateFormVisible(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    try {
      const { id, ...notePayload } = updatedNote; // Extract `id` and use the rest of the payload
      await updateNote(id, notePayload); // Pass `id` as the documentId and `notePayload` as the data
      setSuccessMessage("Note updated successfully!");
      fetchNotes();
      setEditNote({ show: false, data: null });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDeleteNote = (id) => {
    setDeleteConfirmation({ show: true, noteId: id });
  };

  const confirmDelete = async () => {
    try {
      await deleteNote(deleteConfirmation.noteId);
      setSuccessMessage("Note deleted successfully!");
      fetchNotes();
      setDeleteConfirmation({ show: false, noteId: null });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, noteId: null });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert('Please select a PDF file.');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploadingFile(true);
    try {
      const response = await uploadFileToAppwrite(selectedFile); // Should return file object with $id
      const url = storage.getFileView(response.bucketId, response.$id);
      setUploadedFileUrl(url);
      setShowFilePopup(true);
    } catch (err) {
      alert('File upload failed!');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uploadedFileUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const filteredNotes = notes.filter((note) => {
    const branchMatch =
      filters.branch === "All" || note.branch === filters.branch;
    const searchMatch =
      note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      note.description.toLowerCase().includes(filters.search.toLowerCase());
    return branchMatch && searchMatch;
  });

  const renderNoteForm = (noteData = {}, isEdit = false) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 h-5/6 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEdit ? "Edit Note" : "Create Note"}
          </h3>
          <button
            onClick={() =>
              isEdit
                ? setEditNote({ show: false, data: null })
                : setCreateFormVisible(false)
            }
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const notePayload = {
              title: formData.get("title"),
              description: formData.get("description"),
              branch: formData.get("branch"),
              year: formData.get("year"),
              semester: formData.get("semester"),
              subject: formData.get("subject"),
              thumbnailUrl: formData.get("thumbnailUrl"),
              fileUrl: formData.get("fileUrl"),
              uploadedBy: formData.get("uploadedBy"),
              uploadDate: isEdit
                ? noteData.uploadDate
                : new Date().toISOString(), // Automatically set uploadDate
            };
            if (isEdit) {
              handleUpdateNote({ id: noteData.id, ...notePayload });
            } else {
              handleCreateNote(notePayload);
            }
          }}
        >
          <div className="space-y-4">
            {[
              ["title", "Title"],
              ["description", "Description"],
              ["year", "Year"],
              ["semester", "Semester"],
              ["subject", "Subject"],
              ["thumbnailUrl", "Thumbnail Url"],
              ["fileUrl", "File Url"],
              ["uploadedBy", "Uploaded By"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                {name === "description" ? (
                  <textarea
                    name={name}
                    defaultValue={noteData[name] || ""}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name={name}
                    defaultValue={noteData[name] || ""}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch
              </label>
              <select
                name="branch"
                defaultValue={noteData.branch || ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                {branchOptions
                  .filter((opt) => opt !== "All")
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                isEdit
                  ? setEditNote({ show: false, data: null })
                  : setCreateFormVisible(false)
              }
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Update Note" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Create New Notes Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Manage Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage study notes
          </p>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setCreateFormVisible(true)}
            className="btn btn-primary"
          >
            <FiPlus />
            Upload Notes
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-6">
          <div className="w-full sm:w-48">
            <select
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="input"
            >
              {branchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search notes..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
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
            {uploadingFile ? 'Uploading...' : 'Upload'}
          </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload a PDF to get a shareable link. Paste the link in the File URL while uploading notes inside form.
            </p>
          </div>
        </div>
      </div>

      {/* Filtered Notes List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="flex flex-col justify-between h-full rounded-lg border border-gray-300 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div>
              <img
                src={note.thumbnailUrl || "https://via.placeholder.com/150"}
                alt={note.title}
                className="mb-4 h-40 w-full rounded-lg object-cover"
              />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {note.description.length > 100
                  ? `${note.description.slice(0, 90)}...`
                  : note.description}
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Uploaded by: {note.uploadedBy}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-2 md:gap-3">
                <button
                  onClick={() => setPreviewNote(note)}
                  className="btn hover:bg-green-500 bg-green-400 flex-1 min-w-[110px] sm:min-w-[0]"
                >
                  <FiSearch />
                  Notes
                </button>
                <button
                  onClick={() => setEditNote({ show: true, data: note })}
                  className="btn hover:bg-blue-500 bg-blue-400 flex-1 min-w-[110px] sm:min-w-[0]"
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="btn hover:bg-red-500 bg-red-400 flex-1 min-w-[110px] sm:min-w-[0]"
                >
                  <FiTrash />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Popup */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Delete Note
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this note? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDelete}
                className="btn bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="btn bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                onFocus={e => e.target.select()}
              />
              <button
                className="btn btn-sm btn-primary flex items-center gap-1"
                onClick={handleCopy}
              >
                <FiCopy />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Copy and paste this link into the File URL field in the note form.
            </div>
          </div>
        </div>
      )}

      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              onClick={() => setPreviewNote(null)}
            >
              <FiX />
            </button>
            <h2 className="text-xl font-bold mb-4">{previewNote.title}</h2>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={previewNote.fileUrl}
                title={previewNote.title}
                frameBorder="0"
                className="w-full h-96 rounded"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{previewNote.description}</p>
          </div>
        </div>
      )}

      {editNote.show && renderNoteForm(editNote.data, true)}
      {createFormVisible && renderNoteForm({}, false)}
    </div>
  );
};

export default ManageNotes;
