import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../../ui/Button";

const VisitorForm = ({
  initialData = {},
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    purpose: initialData.purpose || "Guest",
    date: initialData.date || "",
    visitTime: initialData.visitTime || "",
    status: initialData.status || "Expected",
  });

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const currentTime = `${String(now.getHours()).padStart(
    2,
    "0"
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/30";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedDateTime = new Date(
      `${formData.date}T${formData.visitTime}`
    );

    if (selectedDateTime < new Date()) {
      toast.error(
        "You cannot book a visitor for a past date or time.",
        {
          duration: 3000,
          position: "top-right",
        }
      );
      return;
    }

    onSubmit(formData);

    toast.success(
      initialData?.id
        ? "Visitor updated successfully!"
        : "Visitor added successfully!",
      {
        duration: 3000,
        position: "top-right",
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Visitor Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Visitor Name
        </label>

        <input
          type="text"
          name="name"
          required
          placeholder="Enter visitor name"
          value={formData.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Phone Number
        </label>

        <input
          type="tel"
          name="phone"
          required
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Purpose
        </label>

        <select
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Guest">Guest</option>
          <option value="Family">Family</option>
          <option value="Friends">Friends</option>
          <option value="Delivery">Delivery</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Visit Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Visit Date
        </label>

        <input
          type="date"
          name="date"
          required
          min={today}
          value={formData.date}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Visit Time */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Visit Time
        </label>

        <input
          type="time"
          name="visitTime"
          required
          min={
            formData.date === today
              ? currentTime
              : undefined
          }
          value={formData.visitTime}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Expected">
            Expected
          </option>
          <option value="Checked In">
            Checked In
          </option>
          <option value="Completed">
            Completed
          </option>
          <option value="Cancelled">
            Cancelled
          </option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData?.id
            ? "Update Visitor"
            : "Add Visitor"}
        </Button>
      </div>
    </form>
  );
};

export default VisitorForm;