import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const ApartmentForm = ({
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [form, setForm] = useState(
    initialData || {
      flat: "",
      block: "",
      floor: "",
      type: "2 BHK",
      owner: "",
      occupancy: "Occupied",
    }
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
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
      <Input label="Flat Number"
        value={form.flat}
        placeholder="Enter Flat Number..." onChange={(e) =>
          handleChange("flat", e.target.value)
        }
      />

      <Input label="Owner"
        value={form.owner}
        placeholder="Enter Owner..." onChange={(e) =>
          handleChange("owner", e.target.value)
        }
      />

      <div className="grid grid-cols-2 gap-4">

        <Input label="Block"
          value={form.block}
          placeholder="Enter Block..." onChange={(e) =>
            handleChange("block", e.target.value)
          }
        />

        <Input label="Floor"
          type="number"
          value={form.floor}
          placeholder="Enter Floor..." onChange={(e) =>
            handleChange("floor", e.target.value)
          }
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Flat Type
          </label>

          <select
            value={form.type}
            onChange={(e) =>
              handleChange("type", e.target.value)
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>1 BHK</option>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>4 BHK</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Occupancy
          </label>

          <select
            value={form.occupancy}
            onChange={(e) =>
              handleChange(
                "occupancy",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Occupied</option>
            <option>Vacant</option>
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
            ? "Update Flat"
            : "Add Flat"}
        </Button>

      </div>

    </form>
  );
};

export default ApartmentForm;