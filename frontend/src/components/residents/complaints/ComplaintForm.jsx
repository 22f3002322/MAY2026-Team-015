import { useEffect, useState } from "react";

import Button from "../../ui/Button";
import useComplaintStore from "../../../store/complaintStore";
import { COMPLAINT_PRIORITY } from "../../../utils/adminMaps";

const ComplaintForm = ({
  initialData = null,
  isEdit = false,
  onSubmit,
  onClose,
}) => {
  const categories = useComplaintStore((s) => s.categories);
  const fetchCategories = useComplaintStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category_id: initialData?.category_id || "",
    priority: initialData?.priorityValue || "medium",
    description: initialData?.description || "",
    imageFile: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      onSubmit({
        description: formData.description,
        priority: formData.priority,
      });
      return;
    }

    const categoryId =
      Number(formData.category_id) || categories[0]?.category_id;
    if (!categoryId) return;

    const description = formData.title
      ? `${formData.title}\n\n${formData.description}`
      : formData.description;

    onSubmit({
      category_id: categoryId,
      description,
      priority: formData.priority,
      imageFile: formData.imageFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isEdit && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Complaint Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        >
          {COMPLAINT_PRIORITY.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          rows={4}
          required
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the issue in detail..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {!isEdit && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Attach Image{" "}
            <span className="text-xs text-slate-400">(Optional - max 5 MB)</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData((prev) => ({ ...prev, imageFile: file }));
              }
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Complaint" : "Submit Complaint"}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintForm;
