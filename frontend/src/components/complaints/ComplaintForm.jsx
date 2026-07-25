import { useState } from "react";
import { UploadCloud } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ComplaintForm = ({
  initialData = null,
  onSubmit,
  onClose,
}) => {
  const [form, setForm] = useState(
    initialData || {
      ticket: "",
      title: "",
      description: "",
      resident: "",
      category: "Electrical",
      priority: "Medium",
      status: "Open",
      assignedTo: "",
      image: null,
    }
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      handleChange("image", file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(form);

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Input
        label="Complaint Title"
        placeholder="Enter complaint title"
        value={form.title}
        onChange={(e) =>
          handleChange("title", e.target.value)
        }
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          rows={5}
          placeholder="Describe your issue..."
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-indigo-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            value={form.category}
            onChange={(e) =>
              handleChange(
                "category",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Electrical</option>
            <option>Plumbing</option>
            <option>Cleaning</option>
            <option>Maintenance</option>
            <option>Security</option>
            <option>Other</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            value={form.priority}
            onChange={(e) =>
              handleChange(
                "priority",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

        </div>

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Attach Image
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 transition hover:border-indigo-500 hover:bg-indigo-50">

          <UploadCloud
            size={40}
            className="mb-3 text-indigo-600"
          />

          <p className="font-medium text-slate-700">
            Click to upload an image
          </p>

          <p className="mt-1 text-sm text-slate-500">
            JPG, PNG (Frontend only)
          </p>

          {form.image && (
            <p className="mt-4 rounded-lg bg-indigo-100 px-3 py-2 text-sm text-indigo-700">
              {form.image}
            </p>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />

        </label>

      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Complaint"
            : "Raise Complaint"}
        </Button>

      </div>

    </form>
  );
};

export default ComplaintForm;