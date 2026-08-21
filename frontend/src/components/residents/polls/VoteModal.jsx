import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import usePollStore from "../../../store/pollStore";

const VoteModal = ({ poll, onClose }) => {
  const votePoll = usePollStore((state) => state.votePoll);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!poll) return null;

  const handleSubmit = async () => {
    if (!selectedOption || submitting) return;

    setSubmitting(true);
    try {
      const res = await votePoll(poll.id, selectedOption);
      if (res?.success) {
        toast.success(res.message || "Vote submitted successfully!");
        onClose();
      } else {
        toast.error(res?.message || "Failed to cast vote.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to cast vote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!poll} title="Cast Your Vote" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {poll.title || poll.question}
          </h2>
          {poll.description ? (
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {poll.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {(poll.options || []).map((option, index) => {
            const optId = option.id;
            const optText = option.text || "";
            return (
              <label
                key={optId || index}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                  selectedOption === optId
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-slate-200 dark:border-slate-700 dark:bg-slate-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="poll"
                  checked={selectedOption === optId}
                  onChange={() => setSelectedOption(optId)}
                  className="h-5 w-5"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {optText}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            disabled={!selectedOption || submitting}
            onClick={handleSubmit}
          >
            <CheckCircle size={18} />
            {submitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VoteModal;
