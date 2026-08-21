import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Users,
  Vote,
  Clock,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import usePollStore from "../../store/pollStore";

const PollDetails = ({ poll, onClose }) => {
  const fetchResults = usePollStore((s) => s.fetchResults);
  const pollResults = usePollStore((s) => s.pollResults);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (!poll?.id && !poll?.poll_id) return;
    const id = poll.id || poll.poll_id;
    setLoadingResults(true);
    fetchResults(id).finally(() => setLoadingResults(false));
  }, [poll?.id, poll?.poll_id, fetchResults]);

  const results = useMemo(() => {
    if (!poll) return null;
    const id = poll.id || poll.poll_id;
    return pollResults[id] || null;
  }, [poll, pollResults]);

  if (!poll) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Upcoming":
        return "warning";
      case "Closed":
        return "secondary";
      default:
        return "default";
    }
  };

  const options = (() => {
    if (results?.results?.length) {
      return results.results.map((o) => ({
        label: o.option_text || o.option || o.label || "Option",
        votes: Number(o.vote_count ?? o.votes ?? 0),
      }));
    }
    return (poll.options || []).map((o) => ({
      label: o.option_text || o.option || "Option",
      votes: Number(o.vote_count ?? o.votes ?? 0),
    }));
  })();

  const totalVotes =
    Number(results?.total_votes ?? poll.totalVotes ?? 0) ||
    options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Poll Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {poll.pollId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {poll.question}
            </h3>
            <div className="mt-3">
              <Badge variant={getStatusVariant(poll.status)}>{poll.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Info icon={Users} label="Total Votes" value={totalVotes} />
            <Info icon={Calendar} label="Start Date" value={poll.startDate || "—"} />
            <Info icon={Calendar} label="End Date" value={poll.endDate || "—"} />
            <Info icon={Vote} label="Options" value={options.length} />
            <Info icon={Clock} label="Status" value={poll.status} />
          </div>

          <div>
            <h4 className="mb-5 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Poll Results
            </h4>
            {loadingResults && options.length === 0 ? (
              <p className="text-sm text-slate-500">Loading results…</p>
            ) : options.length === 0 ? (
              <p className="text-sm text-slate-500">No options available.</p>
            ) : (
              <div className="space-y-5">
                {options.map((item, index) => {
                  const percentage =
                    totalVotes === 0 ? 0 : Math.round((item.votes / totalVotes) * 100);
                  return (
                    <div key={`${item.label}-${index}`}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.votes} votes
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{percentage}% of total votes</span>
                        <span>
                          {item.votes}/{totalVotes}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

export default PollDetails;
