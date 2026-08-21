import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, BarChart3 } from "lucide-react";

import Modal from "../../ui/Modal";
import usePollStore from "../../../store/pollStore";

const PollResults = ({ poll, onClose }) => {
  const fetchResults = usePollStore((state) => state.fetchResults);
  const pollResults = usePollStore((state) => state.pollResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!poll?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchResults(poll.id);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [poll?.id, fetchResults]);

  const live = poll?.id ? pollResults[poll.id] : null;

  const options = useMemo(() => {
    if (live?.results && Array.isArray(live.results)) {
      return live.results.map((r) => ({
        id: r.option_id,
        text: r.option_text || "",
        votes: r.vote_count ?? 0,
      }));
    }
    return (poll?.options || []).map((o) => ({
      id: o.id,
      text: o.text || "",
      votes: o.votes || 0,
    }));
  }, [live, poll]);

  const totalVotes =
    live?.total_votes ?? poll?.totalVotes ?? options.reduce((s, o) => s + (o.votes || 0), 0);

  if (!poll) return null;

  const winner =
    options.length > 0
      ? options.reduce((prev, current) =>
          (prev.votes || 0) > (current.votes || 0) ? prev : current
        )
      : { text: "—" };

  return (
    <Modal open={!!poll} title="Poll Results" onClose={onClose}>
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

        {loading ? (
          <p className="text-sm text-slate-500">Loading results…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950">
                <div className="flex items-center gap-3">
                  <Users className="text-indigo-600" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Votes
                    </p>
                    <h3 className="text-2xl font-bold">{totalVotes}</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/30">
                <div className="flex items-center gap-3">
                  <Trophy className="text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Leading Option
                    </p>
                    <h3 className="font-bold">{winner.text || "—"}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {options.map((option, index) => (
                <div key={option.id || index}>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {option.votes || 0} votes
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: totalVotes
                          ? `${((option.votes || 0) / totalVotes) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                    {totalVotes
                      ? (((option.votes || 0) / totalVotes) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-4 text-sm dark:bg-yellow-900/30 dark:text-slate-300">
          <BarChart3 size={18} />
          Results update after every vote.
        </div>
      </div>
    </Modal>
  );
};

export default PollResults;
