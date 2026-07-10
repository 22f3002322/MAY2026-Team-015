import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

const CheckInOutModal = ({
  visitor,
  onClose,
}) => {
  const [remarks, setRemarks] = useState("");

  if (!visitor) return null;

  const isCheckIn =
    visitor.status === "Checked Out";

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      visitor,
      action: isCheckIn
        ? "Check In"
        : "Check Out",
      remarks,
      time: new Date().toLocaleTimeString(),
    });

    onClose();
  };

  return (
    <Modal
      open={!!visitor}
      title={
        isCheckIn
          ? "Check In Visitor"
          : "Check Out Visitor"
      }
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="rounded-xl border bg-slate-50 p-4">
          <h3 className="font-semibold">
            {visitor.name}
          </h3>

          <p className="text-sm text-slate-500">
            {visitor.visitorId}
          </p>

          <p className="mt-2 text-sm">
            Visiting :
            <span className="font-medium">
              {" "}
              {visitor.resident}
            </span>
          </p>

          <p className="text-sm">
            Flat :
            <span className="font-medium">
              {" "}
              {visitor.flat}
            </span>
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Remarks
          </label>

          <textarea
            rows={4}
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            placeholder={
              isCheckIn
                ? "Security notes..."
                : "Exit remarks..."
            }
            className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600"
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
            {isCheckIn
              ? "Check In"
              : "Check Out"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckInOutModal;