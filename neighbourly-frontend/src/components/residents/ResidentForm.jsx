import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ResidentForm = ({
  onClose,
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

      </div>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Save Resident
        </Button>

      </div>

    </form>
  );
};

export default ResidentForm;