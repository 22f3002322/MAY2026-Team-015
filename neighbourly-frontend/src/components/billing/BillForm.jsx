import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const BillForm = ({
  initialData = null,
  onClose,
}) => {
  const [form, setForm] = useState(
    initialData || {
      resident: "",
      flat: "",
      category: "Maintenance",
      amount: "",
      dueDate: "",
      paidDate: "",
      status: "Pending",
      description: "",
    }
  );

  const [errors, setErrors] = useState({});

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.resident.trim())
      newErrors.resident =
        "Resident name is required.";

    if (!form.flat.trim())
      newErrors.flat =
        "Flat number is required.";

    if (!form.category)
      newErrors.category =
        "Select a category.";

    if (!form.amount)
      newErrors.amount =
        "Amount is required.";

    if (Number(form.amount) <= 0)
      newErrors.amount =
        "Amount must be greater than 0.";

    if (!form.dueDate)
      newErrors.dueDate =
        "Due date is required.";

    if (form.dueDate < today)
      newErrors.dueDate =
        "Due date cannot be before today.";

    if (
      form.status === "Paid" &&
      !form.paidDate
    )
      newErrors.paidDate =
        "Paid date is required.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    console.log(form);

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">

        <Input
          label="Resident Name"
          value={form.resident}
          error={errors.resident}
          onChange={(e) =>
            handleChange(
              "resident",
              e.target.value
            )
          }
        />

        <Input
          label="Flat Number"
          value={form.flat}
          error={errors.flat}
          onChange={(e) =>
            handleChange(
              "flat",
              e.target.value
            )
          }
        />

        {/* Category */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            value={form.category}
            onChange={(e) =>
              handleChange(
                "category",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Maintenance</option>
            <option>Water</option>
            <option>Electricity</option>
            <option>Parking</option>
            <option>Club House</option>
            <option>Other</option>
          </select>

          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category}
            </p>
          )}
        </div>

        <Input
          type="number"
          label="Amount"
          value={form.amount}
          error={errors.amount}
          onChange={(e) =>
            handleChange(
              "amount",
              e.target.value
            )
          }
        />

        {/* Due Date */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Due Date
          </label>

          <input
            type="date"
            min={today}
            value={form.dueDate}
            onChange={(e) =>
              handleChange(
                "dueDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />

          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.dueDate}
            </p>
          )}
        </div>

        {/* Paid Date */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Paid Date
          </label>

          <input
            type="date"
            value={form.paidDate}
            onChange={(e) =>
              handleChange(
                "paidDate",
                e.target.value
              )
            }
            disabled={form.status !== "Paid"}
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none disabled:bg-slate-100 focus:border-indigo-600"
          />

          {errors.paidDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.paidDate}
            </p>
          )}
        </div>

        {/* Status */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>
        </div>

      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          placeholder="Enter bill description..."
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Bill"
            : "Generate Bill"}
        </Button>

      </div>
    </form>
  );
};

export default BillForm;