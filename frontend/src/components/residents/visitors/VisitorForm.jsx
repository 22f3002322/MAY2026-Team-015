import { useState } from "react";
import { toast } from "sonner";

import Button from "../../ui/Button";

const VisitorForm = ({ flatLabel, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "Guest",
    date: "",
    visitTime: "",
  });

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/30";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const selectedDateTime = new Date(
      `${formData.date}T${formData.visitTime}`
    );
    if (selectedDateTime < new Date()) {
      toast.error("You cannot book a visitor for a past date or time.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {flatLabel ? (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Visiting flat: <span className="font-semibold">{flatLabel}</span>
        </div>
      ) : null}

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

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Visit Time
        </label>
        <input
          type="time"
          name="visitTime"
          required
          min={formData.date === today ? currentTime : undefined}
          value={formData.visitTime}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {loading ? "Registering..." : "Add Visitor"}
        </Button>
      </div>
    </form>
  );
};

export default VisitorForm;
