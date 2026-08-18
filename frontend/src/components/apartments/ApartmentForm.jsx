import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { useBlockOptions } from "../../utils/useBlockOptions";

const ApartmentForm = ({
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}) => {
  const blocks = useBlockOptions();
  const [form, setForm] = useState(
    initialData || {
      flat: "",
      block_id: "",
      floor: "",
      type: "2BHK",
    }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !form.block_id) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Flat Number"
        value={form.flat}
        placeholder="e.g. 101"
        required
        onChange={(e) => handleChange("flat", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Block</label>
          <select
            value={form.block_id || ""}
            onChange={(e) => handleChange("block_id", e.target.value)}
            disabled={isEdit}
            required={!isEdit}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 disabled:opacity-60"
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
          label="Floor"
          type="number"
          value={form.floor}
          placeholder="Floor"
          required
          onChange={(e) => handleChange("floor", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Flat Type</label>
        <select
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="h-14 w-full rounded-xl border border-slate-300 px-4"
        >
          <option value="1BHK">1 BHK</option>
          <option value="2BHK">2 BHK</option>
          <option value="3BHK">3 BHK</option>
          <option value="4BHK">4 BHK</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {initialData ? "Update Flat" : "Add Flat"}
        </Button>
      </div>
    </form>
  );
};

export default ApartmentForm;
