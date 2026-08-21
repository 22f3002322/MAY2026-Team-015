import { useState } from "react";

import Button from "../../ui/Button";

const ProfileForm = ({ initialData, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    alternatePhone: initialData?.alternatePhone || "",
    occupation: initialData?.occupation || "",
    block: initialData?.block || "",
    flat: initialData?.flat || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        occupation: formData.occupation,
      });
    } finally {
      setLoading(false);
    }
  };

  const disabledClass = "bg-slate-100 cursor-not-allowed text-slate-500 dark:bg-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          disabled
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none dark:border-slate-700 ${disabledClass}`}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none dark:border-slate-700 ${disabledClass}`}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Alternate Phone
        </label>
        <input
          type="tel"
          name="alternatePhone"
          value={formData.alternatePhone}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Occupation
        </label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Block
          </label>
          <input
            type="text"
            name="block"
            value={formData.block}
            disabled
            className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none dark:border-slate-700 ${disabledClass}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Flat
          </label>
          <input
            type="text"
            name="flat"
            value={formData.flat}
            disabled
            className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none dark:border-slate-700 ${disabledClass}`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
