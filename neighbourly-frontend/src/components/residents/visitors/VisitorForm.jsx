import { useState } from "react";

import Button from "../../ui/Button";

const VisitorForm = ({
  initialData = {},
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] =
    useState({
      name:
        initialData.name || "",
      phone:
        initialData.phone || "",
      purpose:
        initialData.purpose ||
        "Guest",
      date:
        initialData.date || "",
      visitTime:
        initialData.visitTime || "",
      status:
        initialData.status ||
        "Expected",
    });

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      {/* Visitor Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Visitor Name
        </label>

        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        />
      </div>

      {/* Phone */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Phone Number
        </label>

        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        />
      </div>

      {/* Purpose */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Purpose
        </label>

        <select
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        >
          <option>
            Guest
          </option>

          <option>
            Family
          </option>

          <option>
            Friends
          </option>

          <option>
            Delivery
          </option>

          <option>
            Maintenance
          </option>

          <option>
            Other
          </option>
        </select>
      </div>

      {/* Visit Date */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Visit Date
        </label>

        <input
          type="date"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        />
      </div>

      {/* Visit Time */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Visit Time
        </label>

        <input
          type="time"
          name="visitTime"
          required
          value={formData.visitTime}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        />
      </div>

      {/* Status */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-600 outline-none"
        >
          <option>
            Expected
          </option>

          <option>
            Checked In
          </option>

          <option>
            Completed
          </option>

          <option>
            Cancelled
          </option>
        </select>
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData.id
            ? "Update Visitor"
            : "Add Visitor"}
        </Button>
      </div>
    </form>
  );
};

export default VisitorForm;