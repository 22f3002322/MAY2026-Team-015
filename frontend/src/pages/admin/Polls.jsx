import { useState } from "react";

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
  // Zustand

  const polls = usePollStore(
    (state) => state.polls
  );

  const deletePollById = usePollStore(
    (state) => state.deletePoll
  );

  // Filters

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("");

  // CRUD

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedPoll, setSelectedPoll] =
    useState(null);

  const [editingPoll, setEditingPoll] =
    useState(null);

  const [deletePoll, setDeletePoll] =
    useState(null);

  // Filtered Polls

  const filteredPolls = polls.filter(
    (poll) => {
      const matchesSearch =
        poll.question
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        poll.pollId
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "" ||
        poll.category === category;

      const matchesStatus =
        status === "" ||
        poll.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    }
  );

  return (
    <Layout
      title="Polls"
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
        category={category}
        setCategory={setCategory}
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

      {/* Add / Edit */}

      <Modal
        open={openModal}
        title={
          editingPoll
            ? "Edit Poll"
            : "Create Poll"
        }
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

      {/* Details */}

      <PollDetails
        poll={selectedPoll}
        onClose={() =>
          setSelectedPoll(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deletePoll}
        title="Delete Poll"
        message={`Delete "${deletePoll?.question}"?`}
        confirmText="Delete"
        onCancel={() =>
          setDeletePoll(null)
        }
        onConfirm={() => {
          deletePollById(deletePoll.id);

          setDeletePoll(null);
        }}
      />
    </Layout>
  );
};

export default Polls;