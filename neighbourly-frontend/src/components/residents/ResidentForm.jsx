import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ResidentForm = ({
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      email: "",
      phone: "",
      block: "",
      flat: "",
      occupancy: "Owner",
      status: "Active",
    }
  );

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
      <Input
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />

      <Input
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Block
          </label>

          <select
            name="block"
            value={form.block}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option value="">Select Block</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>

        </div>

        <Input
          label="Flat"
          name="flat"
          value={form.flat}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Occupancy
          </label>

          <select
            name="occupancy"
            value={form.occupancy}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Owner</option>
            <option>Tenant</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
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