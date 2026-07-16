import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const StaffForm = ({
  initialData = null,
  onSubmit,
  onClose,
}) => {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      department: "Security",
      designation: "",
      phone: "",
      email: "",
      password: "staff123",
      shift: "Morning",
      joiningDate: "",
      salary: "",
      status: "Active",
    }
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      salary: Number(form.salary),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input label="Full Name"
        value={form.name}
        placeholder="Enter Full Name..." onChange={(e) =>
          handleChange("name", e.target.value)
        }
      />

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Department
          </label>

          <select
            value={form.department}
            onChange={(e) =>
              handleChange(
                "department",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Security</option>
            <option>Housekeeping</option>
            <option>Maintenance</option>
            <option>Gardening</option>
            <option>Office</option>
          </select>
        </div>

        <Input label="Designation"
          value={form.designation}
          placeholder="Enter Designation..." onChange={(e) =>
            handleChange(
              "designation",
              e.target.value
            )
          }
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <Input label="Phone"
          value={form.phone}
          placeholder="Enter Phone..." onChange={(e) =>
            handleChange("phone", e.target.value)
          }
        />

        <Input label="Email"
          type="email"
          value={form.email}
          placeholder="Enter Email..." onChange={(e) =>
            handleChange("email", e.target.value)
          }
        />

      </div>

      <Input label="Password (for Staff Login)"
        type="text"
        value={form.password || ""}
        placeholder="Enter Password..." onChange={(e) =>
          handleChange("password", e.target.value)
        }
        required
      />

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Shift
          </label>

          <select
            value={form.shift}
            onChange={(e) =>
              handleChange("shift", e.target.value)
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Morning</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
        </div>

        <Input label="Joining Date"
          type="date"
          value={form.joiningDate}
          placeholder="Enter Joining Date..." onChange={(e) =>
            handleChange(
              "joiningDate",
              e.target.value
            )
          }
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <Input label="Salary"
          type="number"
          value={form.salary}
          placeholder="Enter Salary..." onChange={(e) =>
            handleChange("salary", e.target.value)
          }
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              handleChange("status", e.target.value)
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-3">

        <Button
          variant="outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Staff"
            : "Add Staff"}
        </Button>

      </div>
    </form>
  );
};

export default StaffForm;