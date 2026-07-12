import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import useBookingStore from "../../store/bookingStore";

const BookingForm = ({
  initialData = null,
  onClose,
}) => {
  const addBooking = useBookingStore(
    (state) => state.addBooking
  );

  const updateBooking = useBookingStore(
    (state) => state.updateBooking
  );

  const [form, setForm] = useState(
    initialData || {
      resident: "",
      flat: "",
      facility: "",
      date: "",
      slot: "",
      guests: "",
      amount: "",
      status: "Pending",
      paymentStatus: "Pending",
      notes: "",
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

    if (!form.facility)
      newErrors.facility =
        "Select a facility.";

    if (!form.date)
      newErrors.date =
        "Booking date is required.";

    if (form.date < today)
      newErrors.date =
        "Past dates are not allowed.";

    if (!form.slot)
      newErrors.slot =
        "Time slot is required.";

    if (
      !form.guests ||
      Number(form.guests) <= 0
    )
      newErrors.guests =
        "Guests must be greater than 0.";

    if (
      !form.amount ||
      Number(form.amount) <= 0
    )
      newErrors.amount =
        "Enter a valid amount.";

    return newErrors;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const bookingData = {
      ...form,
      guests: Number(form.guests),
      amount: Number(form.amount),
      date: formatDate(form.date),
    };

    if (initialData) {
      updateBooking({
        ...initialData,
        ...bookingData,
        createdAt: initialData.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addBooking({
        id: Date.now(),
        bookingId: `BK-${Date.now()}`,
        ...bookingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
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

        <div>
          <label className="mb-2 block text-sm font-medium">
            Facility
          </label>

          <select
            value={form.facility}
            onChange={(e) =>
              handleChange(
                "facility",
                e.target.value
              )
            }
            className={`h-14 w-full rounded-xl border px-4 ${errors.facility
                ? "border-red-500"
                : "border-slate-300"
              }`}
          >
            <option value="">
              Select Facility
            </option>
            <option>Club House</option>
            <option>Swimming Pool</option>
            <option>Gym</option>
            <option>Party Hall</option>
            <option>Tennis Court</option>
          </select>

          {errors.facility && (
            <p className="mt-1 text-sm text-red-600">
              {errors.facility}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Booking Date
          </label>

          <input
            type="date"
            min={today}
            value={form.date}
            onChange={(e) =>
              handleChange(
                "date",
                e.target.value
              )
            }
            className={`h-14 w-full rounded-xl border px-4 ${errors.date
                ? "border-red-500"
                : "border-slate-300"
              }`}
          />

          {errors.date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.date}
            </p>
          )}
        </div>

        <Input
          label="Time Slot"
          placeholder="10:00 AM - 12:00 PM"
          value={form.slot}
          error={errors.slot}
          onChange={(e) =>
            handleChange(
              "slot",
              e.target.value
            )
          }
        />

        <Input
          type="number"
          label="Guests"
          value={form.guests}
          error={errors.guests}
          onChange={(e) =>
            handleChange(
              "guests",
              e.target.value
            )
          }
        />

        <Input
          type="number"
          label="Booking Amount"
          value={form.amount}
          error={errors.amount}
          onChange={(e) =>
            handleChange(
              "amount",
              e.target.value
            )
          }
        />

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
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) =>
            handleChange(
              "notes",
              e.target.value
            )
          }
          placeholder="Additional notes..."
          className="w-full rounded-xl border border-slate-300 p-4"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Booking"
            : "Create Booking"}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;