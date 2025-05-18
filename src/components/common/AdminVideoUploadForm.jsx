import { useState, useEffect } from "react";

const branchOptions = [
  "Computer Science",
  "Electrical Engineering",
  "Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

const yearOptions = ["1", "2", "3", "4"];
const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

const AdminVideoUploadForm = ({ onSubmit, loading, initialData, isEdit, onCancel }) => {
  const [form, setForm] = useState(
    initialData || {
      title: "",
      description: "",
      branch: "Computer Science",
      year: "1",
      semester: "1",
      fileUrl: "",
      thumbnailUrl: "",
    }
  );

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Simple validation
    if (!form.title || !form.description || !form.branch || !form.year || !form.semester || !form.fileUrl) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      await onSubmit(form);
      setForm({
        title: "",
        description: "",
        branch: form.branch,
        year: form.year,
        semester: form.semester,
        fileUrl: "",
        thumbnailUrl: "",
      });
    } catch (err) {
      setError("Failed to upload video.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Upload Video</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block mb-1 font-medium">Title*</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Description*</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input w-full min-h-[80px]"
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Branch*</label>
          <select
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="input w-full"
            required
          >
            {branchOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Year*</label>
          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            className="input"
            required
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Semester*</label>
          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            className="input"
            required
          >
            {semesterOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">YouTube Video URL*</label>
        <input
          type="url"
          name="fileUrl"
          value={form.fileUrl}
          onChange={handleChange}
          className="input w-full"
          placeholder="https://youtube.com/..."
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Thumbnail URL</label>
        <input
          type="url"
          name="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={handleChange}
          className="input w-full"
          placeholder="https://..."
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? (isEdit ? "Updating..." : "Uploading...") : (isEdit ? "Update" : "Upload")}
      </button>
      {isEdit && (
        <button type="button" className="btn w-full mt-2" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default AdminVideoUploadForm;