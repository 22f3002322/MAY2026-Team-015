import { useState } from "react";
import { toast } from "sonner";

import Button from "../../ui/Button";
import useFacilityStore from "../../../store/facilityStore";

const FacilityBookingForm = ({ facility, onClose }) => {
  const addBooking = useFacilityStore((state) => state.addBooking);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
    guests: "",
  });

  const facilityName = facility.name || facility.facility_name || "Facility";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select start and end times.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    setLoading(true);
    const formattedStartTime =
      formData.startTime.length === 5
        ? `${formData.startTime}:00`
        : formData.startTime;
    const formattedEndTime =
      formData.endTime.length === 5
        ? `${formData.endTime}:00`
        : formData.endTime;

    const res = await addBooking({
      facilityId: facility.facility_id || facility.id,
      facility_id: facility.facility_id || facility.id,
      facility: facilityName,
      date: formData.date,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      time: `${formData.startTime} - ${formData.endTime}`,
      guest_count: formData.guests ? Number(formData.guests) : undefined,
    });

    setLoading(false);
    if (res && res.success) {
      toast.success(`${facilityName} booked successfully!`);
      onClose();
    } else {
      toast.error(
        res?.message ||
          "Failed to book facility. Please check slot availability."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Facility
        </label>
        <input
          type="text"
          value={facilityName}
          disabled
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Booking Date
        </label>
        <input
          type="date"
          name="date"
          required
          value={formData.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            required
            value={formData.startTime}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            required
            value={formData.endTime}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Number of Guests (optional)
        </label>
        <input
          type="number"
          name="guests"
          min="1"
          value={formData.guests}
          onChange={handleChange}
          placeholder="e.g. 4"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {loading ? "Booking..." : "Book Facility"}
        </Button>
      </div>
    </form>
  );
};

export default FacilityBookingForm;
