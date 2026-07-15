import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const VisitorForm = ({
  initialData = null,
  onSubmit,
  onClose,
}) => {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      phone: "",
      resident: "",
      flat: "",
      purpose: "",
      vehicle: "",
      visitDate: "",
      visitTime: "",
      idType: "Aadhaar Card",
      idNumber: "",
      status: "Expected",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.name.trim())
      newErrors.name = "Visitor name is required.";

    if (!/^[0-9]{10}$/.test(form.phone))
      newErrors.phone =
        "Enter a valid 10-digit mobile number.";

    if (!form.resident.trim())
      newErrors.resident =
        "Resident name is required.";

    if (!form.flat.trim())
      newErrors.flat =
        "Flat number is required.";

    if (!form.purpose.trim())
      newErrors.purpose =
        "Purpose is required.";

    if (!form.visitDate)
      newErrors.visitDate =
        "Visit date is required.";

    if (form.visitDate < today)
      newErrors.visitDate =
        "Past dates are not allowed.";

    if (!form.visitTime)
      newErrors.visitTime =
        "Visit time is required.";

    if (!form.idNumber.trim())
      newErrors.idNumber =
        "ID number is required.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    onSubmit(form);

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">

        <Input label="Visitor Name"
          value={form.name}
          error={errors.name}
          onChange={(e) = placeholder="Enter Visitor Name..." >
            handleChange("name", e.target.value)
          }
        />

        <Input label="Mobile Number"
          value={form.phone}
          error={errors.phone}
          onChange={(e) = placeholder="Enter Mobile Number..." >
            handleChange("phone", e.target.value)
          }
        />

        <Input label="Resident Name"
          value={form.resident}
          error={errors.resident}
          onChange={(e) = placeholder="Enter Resident Name..." >
            handleChange(
              "resident",
              e.target.value
            )
          }
        />

        <Input label="Flat Number"
          value={form.flat}
          error={errors.flat}
          onChange={(e) = placeholder="Enter Flat Number..." >
            handleChange("flat", e.target.value)
          }
        />

        <Input label="Purpose"
          value={form.purpose}
          error={errors.purpose}
          onChange={(e) = placeholder="Enter Purpose..." >
            handleChange(
              "purpose",
              e.target.value
            )
          }
        />

        <Input label="Vehicle Number (Optional)"
          value={form.vehicle}
          onChange={(e) = placeholder="Enter Vehicle Number (Optional)..." >
            handleChange(
              "vehicle",
              e.target.value
            )
          }
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Visit Date
          </label>

          <input
            type="date"
            min={today}
            value={form.visitDate}
            onChange={(e) =>
              handleChange(
                "visitDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          />

          {errors.visitDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.visitDate}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Visit Time
          </label>

          <input
            type="time"
            value={form.visitTime}
            onChange={(e) =>
              handleChange(
                "visitTime",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          />

          {errors.visitTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.visitTime}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            ID Proof
          </label>

          <select
            value={form.idType}
            onChange={(e) =>
              handleChange(
                "idType",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Aadhaar Card</option>
            <option>PAN Card</option>
            <option>Driving License</option>
            <option>Passport</option>
          </select>
        </div>

        <Input label="ID Number"
          value={form.idNumber}
          error={errors.idNumber}
          onChange={(e) = placeholder="Enter ID Number..." >
            handleChange(
              "idNumber",
              e.target.value
            )
          }
        />

      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Visitor"
            : "Register Visitor"}
        </Button>

      </div>
    </form>
  );
};

export default VisitorForm;