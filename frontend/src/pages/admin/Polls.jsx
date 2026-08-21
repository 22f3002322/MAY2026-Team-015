import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";

import PollStats from "../../components/polls/PollStats";
import PollFilters from "../../components/polls/PollFilters";
import PollTable from "../../components/polls/PollTable";
import PollForm from "../../components/polls/PollForm";
import PollDetails from "../../components/polls/PollDetails";
import PollResultsChart from "../../components/polls/PollResultsChart";
import PollStatusChart from "../../components/polls/PollStatusChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import usePollStore from "../../store/pollStore";

const Polls = () => {
  const polls = usePollStore((state) => state.polls);
  const fetchPolls = usePollStore((state) => state.fetchPolls);
  const updatePoll = usePollStore((state) => state.updatePoll);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // CRUD
  const [openModal, setOpenModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [editingPoll, setEditingPoll] = useState(null);
  const [deletePoll, setDeletePoll] = useState(null);

  const mappedPolls = useMemo(() => {
    return polls.map((p) => ({
      id: p.poll_id || p.id,
      pollId: `POLL-${p.poll_id || p.id}`,
      question: p.question || p.title || "Community Poll",
      category: p.category || "General",
      status: p.is_active ? "Active" : "Closed",
      totalVotes: p.total_votes || p.totalVotes || 0,
      options: p.options || [],
      startDate: p.start_date || p.startDate,
      endDate: p.end_date || p.endDate,
    }));
  }, [polls]);

  const filteredPolls = useMemo(() => {
    return mappedPolls.filter((poll) => {
      const matchesSearch =
        (poll.question || "").toLowerCase().includes(search.toLowerCase()) ||
        (poll.pollId || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "" || poll.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [mappedPolls, search, status]);

  return (
    <Layout
      title="Community Polls Management"
      breadcrumb={["Home", "Polls"]}
    >
      <PollStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <PollResultsChart />
        <PollStatusChart />
      </div>

      <PollFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onCreate={() => {
          setEditingPoll(null);
          setOpenModal(true);
        }}
      />

      <PollTable
        polls={filteredPolls}
        onView={setSelectedPoll}
        onEdit={(poll) => {
          setEditingPoll(poll);
          setOpenModal(true);
        }}
        onDelete={setDeletePoll}
      />

      {/* Add / Edit Modal */}
      <Modal
        open={openModal}
        title={editingPoll ? "Edit Poll" : "Create Poll"}
        onClose={() => {
          setOpenModal(false);
          setEditingPoll(null);
        }}
      >
        <PollForm
          initialData={editingPoll}
          onClose={() => {
            setOpenModal(false);
            setEditingPoll(null);
          }}
        />
      </Modal>

      {/* Details Modal */}
      <PollDetails
        poll={selectedPoll}
        onClose={() => setSelectedPoll(null)}
      />

      {/* Close/Deactivate Confirm Dialog */}
      <ConfirmDialog
        open={!!deletePoll}
        title="Close Poll"
        message={`Are you sure you want to end/close "${deletePoll?.question}"?`}
        confirmText="Close Poll"
        onCancel={() => setDeletePoll(null)}
        onConfirm={async () => {
          if (!deletePoll) return;
          const res = await updatePoll(deletePoll.id, { is_active: false });
          if (res?.success) {
            toast.success("Poll closed successfully.");
            setDeletePoll(null);
          } else {
            toast.error(res?.message || "Failed to close poll.");
          }
        }}
      />
    </Layout>
  );
};

export default Polls;