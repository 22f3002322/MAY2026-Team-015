import { useState } from "react";

import Button from "../../ui/Button";

const ComplaintForm = ({
  initialData = {},
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    category:
      initialData.category || "Electrical",
    priority:
      initialData.priority || "Medium",
    description:
      initialData.description || "",
    status: initialData.status || "Open",
  });

  const handleChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Title */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Complaint Title
        </label>

        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) =>
            handleChange(
              "title",
              e.target.value
            )
          }
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Category */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category
        </label>

        <select
          value={formData.category}
          onChange={(e) =>
            handleChange(
              "category",
              e.target.value
            )
          }
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        >
          <option>Electrical</option>
          <option>Plumbing</option>
          <option>Security</option>
          <option>Cleaning</option>
          <option>Parking</option>
          <option>Other</option>
        </select>
      </div>

      {/* Priority */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Priority
        </label>

        <select
          value={formData.priority}
          onChange={(e) =>
            handleChange(
              "priority",
              e.target.value
            )
          }
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          rows={5}
          required
          value={formData.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData.id
            ? "Update Complaint"
            : "Submit Complaint"}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintForm;