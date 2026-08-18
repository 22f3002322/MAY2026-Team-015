import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ResidentForm = ({
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
    block: initialData?.block || "",
    flat: initialData?.flat || "",
    occupancy: initialData?.occupancy || initialData?.occupation || "Owner",
    status: initialData?.status || "Active",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
       placeholder="Enter Full Name..." />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
         placeholder="Enter Email..." />

        <Input label={initialData ? "New Password (Leave blank to keep existing)" : "Password (for Resident Login)"}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required={!initialData}
         placeholder={initialData ? "Leave blank to keep current..." : "Enter Password..."} />
      </div>

      <Input label="Phone"
        name="phone"
        value={form.phone}
        onChange={handleChange}
       placeholder="Enter Phone..." />

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Block
          </label>

          <select
            name="block"
            value={form.block}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">Select Block</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>

        </div>

        <Input label="Flat"
          name="flat"
          value={form.flat}
          onChange={handleChange}
         placeholder="Enter Flat..." />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Occupancy
          </label>

          <select
            name="occupancy"
            value={form.occupancy}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option>Owner</option>
            <option>Tenant</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Resident"
            : "Add Resident"}
        </Button>

      </div>

    </form>
  );
};

export default ResidentForm;