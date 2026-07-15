import { useState } from "react";

import Button from "../../ui/Button";

import useFacilityStore from "../../../store/facilityStore";

const FacilityBookingForm = ({
  facility,
  onClose,
}) => {
  const addBooking = useFacilityStore(
    (state) => state.addBooking
  );

  const [formData, setFormData] =
    useState({
      date: "",
      time: "",
      purpose: "",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addBooking({
      facilityId: facility.id,
      facility: facility.name,
      date: formData.date,
      time: formData.time,
      purpose: formData.purpose,
    });

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Facility */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Facility
        </label>

        <input
          type="text"
          value={facility.name}
          disabled
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4"
        />
      </div>

      {/* Date */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Booking Date
        </label>

        <input
          type="date"
          name="date"
          required
          value={formData.date}
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Time */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Time Slot
        </label>

        <select
          name="time"
          required
          value={formData.time}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        >
          <option value="">
            Select Time Slot
          </option>

          <option>
            06:00 AM - 07:00 AM
          </option>

          <option>
            07:00 AM - 08:00 AM
          </option>

          <option>
            08:00 AM - 09:00 AM
          </option>

          <option>
            09:00 AM - 10:00 AM
          </option>

          <option>
            04:00 PM - 05:00 PM
          </option>

          <option>
            05:00 PM - 06:00 PM
          </option>

          <option>
            06:00 PM - 07:00 PM
          </option>

          <option>
            07:00 PM - 08:00 PM
          </option>

          <option>
            08:00 PM - 09:00 PM
          </option>
        </select>
      </div>

      {/* Purpose */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Purpose
        </label>

        <textarea
          rows={4}
          required
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Enter booking purpose..."
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600 resize-none"
        />
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Book Facility
        </Button>

      </div>

    </form>
  );
};

export default FacilityBookingForm;