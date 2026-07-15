import { useState } from "react";

import Button from "../../ui/Button";

import useEventStore from "../../../store/eventStore";

const EventRegistrationForm = ({
  event,
  onClose,
}) => {
  const registerEvent = useEventStore(
    (state) => state.registerEvent
  );

  const [members, setMembers] =
    useState(1);

  const [remarks, setRemarks] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    registerEvent(
      event,
      Number(members),
      remarks
    );

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Event */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Event
        </label>

        <input
          type="text"
          disabled
          value={event.title}
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4"
        />
      </div>

      {/* Date */}

      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Date
          </label>

          <input
            type="text"
            disabled
            value={event.date}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Time
          </label>

          <input
            type="text"
            disabled
            value={event.time}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4"
          />
        </div>

      </div>

      {/* Members */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Number of Attendees
        </label>

        <input
          type="number"
          min={1}
          max={10}
          required
          value={members}
          onChange={(e) =>
            setMembers(e.target.value)
          }
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Remarks */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Remarks (Optional)
        </label>

        <textarea
          rows={4}
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
          placeholder="Any special requests..."
          className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600"
        />
      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Confirm Registration
        </Button>

      </div>

    </form>
  );
};

export default EventRegistrationForm;