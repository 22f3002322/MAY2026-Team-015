import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import useVisitorStore from "../../store/visitorStore";

const CheckInOutModal = ({
  visitor,
  onClose,
}) => {
  const updateVisitor = useVisitorStore(
    (state) => state.updateVisitor
  );

  const [remarks, setRemarks] = useState("");

  if (!visitor) return null;

  const isCheckIn =
    visitor.status === "Checked Out";

  const handleSubmit = (e) => {
    e.preventDefault();

    updateVisitor(visitor.id, {
      status: isCheckIn
        ? "Checked In"
        : "Checked Out",

      remarks,

      lastActionTime:
        new Date().toLocaleTimeString(),

      updatedAt:
        new Date().toISOString(),
    });

    setRemarks("");

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
      onClose={() => {
        setRemarks("");
        onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            {visitor.name}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {visitor.visitorId}
          </p>

          <p className="mt-2 text-sm">
            Visiting :
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {" "}
              {visitor.resident}
            </span>
          </p>

          <p className="text-sm">
            Flat :
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {" "}
              {visitor.flat}
            </span>
          </p>

          <p className="mt-2 text-sm">
            Current Status :
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {" "}
              {visitor.status}
            </span>
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRemarks("");
              onClose();
            }}
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