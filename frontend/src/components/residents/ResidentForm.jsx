import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { useBlockOptions } from "../../utils/useBlockOptions";
import { OCCUPANCY_UI_OPTIONS } from "../../utils/adminMaps";

const ResidentForm = ({
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const isEdit = Boolean(initialData);
  const blocks = useBlockOptions();
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
    block_id: "",
    block: initialData?.block || "",
    flat: initialData?.flat || "",
    occupancy: initialData?.occupancy || "Owner",
    occupation: initialData?.occupation || "",
    emergency_contact: initialData?.emergency_contact || "",
    alternate_phone: initialData?.alternate_phone || "",
    status: initialData?.status || "Active",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isEdit && (
        <>
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter Full Name..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter Email..."
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter Password..."
            />
          </div>

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter Phone..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Block
              </label>
              <select
                name="block_id"
                value={form.block_id}
                onChange={(e) => {
                  const opt = blocks.find((b) => String(b.block_id) === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    block_id: e.target.value,
                    block: opt?.block_name || "",
                  }));
                }}
                required
                className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4"
              >
                <option value="">Select Block</option>
                {blocks.map((b) => (
                  <option key={b.block_id} value={b.block_id}>
                    {b.block_name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Flat"
              name="flat"
              value={form.flat}
              onChange={handleChange}
              required
              placeholder="e.g. 101"
            />
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
                className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4"
              >
                {OCCUPANCY_UI_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Occupation (job)"
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </>
      )}

      {isEdit && (
        <>
          <Input
            label="Occupation (job)"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            placeholder="Job / profession"
          />
          <Input
            label="Emergency Contact"
            name="emergency_contact"
            value={form.emergency_contact}
            onChange={handleChange}
            placeholder="Emergency contact"
          />
          <Input
            label="Alternate Phone"
            name="alternate_phone"
            value={form.alternate_phone}
            onChange={handleChange}
            placeholder="Alternate phone"
          />
        </>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {isEdit ? "Update Resident" : "Add Resident"}
        </Button>
      </div>
    </form>
  );
};

export default ResidentForm;
