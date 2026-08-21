import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";
import PollStats from "../../components/residents/polls/PollStats";
import PollFilters from "../../components/residents/polls/PollFilters";
import PollCard from "../../components/residents/polls/PollCard";
import VoteModal from "../../components/residents/polls/VoteModal";
import PollResults from "../../components/residents/polls/PollResults";
import PreviousPolls from "../../components/residents/polls/PreviousPolls";

import usePollStore from "../../store/pollStore";
import useAuthStore from "../../store/authStore";

const mapPoll = (p) => ({
  id: p.poll_id || p.id,
  title: p.question || p.title || "Community Poll",
  question: p.question || p.title || "Community Poll",
  description: p.description || "",
  status: p.is_active ? "Active" : "Closed",
  is_active: !!p.is_active,
  totalVotes: p.total_votes ?? p.totalVotes ?? 0,
  userVoted: !!(p.user_voted ?? p.userVoted),
  expiryDate: p.end_date || p.endDate || p.expiryDate || null,
  createdAt: p.created_at || p.createdAt || p.start_date || null,
  options: (p.options || []).map((o) => ({
    id: o.option_id ?? o.id,
    text: o.option_text || o.text || o.option || "",
    votes: o.vote_count ?? o.votes ?? 0,
  })),
});

const Polls = () => {
  const { user, isVerified } = useAuthStore();
  const polls = usePollStore((state) => state.polls);
  const fetchPolls = usePollStore((state) => state.fetchPolls);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Active");
  const [sort, setSort] = useState("newest");
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [resultPoll, setResultPoll] = useState(null);

  const mappedPolls = useMemo(() => polls.map(mapPoll), [polls]);

  const filteredPolls = useMemo(() => {
    let data = [...mappedPolls];

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((poll) =>
        (poll.title || "").toLowerCase().includes(query)
      );
    }

    if (status) {
      data = data.filter((poll) => poll.status === status);
    }

    data.sort((a, b) => {
      if (sort === "votes") {
        return (b.totalVotes || 0) - (a.totalVotes || 0);
      }
      if (sort === "expiry") {
        return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return data;
  }, [mappedPolls, search, status, sort]);

  return (
    <Layout title="Community Polls" breadcrumb={["Resident", "Polls"]}>
      <PollStats polls={mappedPolls} />

      <PollFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
      />

      <section className="mb-12">
        <div className="mb-6 flex justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {status === "Closed" ? "Closed Polls" : status === "Active" ? "Active Polls" : "Polls"}
          </h2>
          <span className="text-sm text-slate-500">
            {filteredPolls.length} Polls
          </span>
        </div>

        {filteredPolls.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-16 text-center">
            No polls found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={(p) => {
                  const userIsVerified =
                    isVerified === true && user?.isVerified !== false;
                  if (!userIsVerified) {
                    toast.error(
                      "Your account must be verified by the Committee to vote on polls."
                    );
                    return;
                  }
                  setSelectedPoll(p);
                }}
                onResults={setResultPoll}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
          Previous Polls
        </h2>
        <PreviousPolls polls={mappedPolls} />
      </section>

      <VoteModal poll={selectedPoll} onClose={() => setSelectedPoll(null)} />
      <PollResults poll={resultPoll} onClose={() => setResultPoll(null)} />
    </Layout>
  );
};

export default Polls;
