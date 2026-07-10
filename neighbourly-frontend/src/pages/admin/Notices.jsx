import { useState } from "react";

import Layout from "../../components/layout/Layout";

import NoticeStats from "../../components/notices/NoticeStats";
import NoticeFilters from "../../components/notices/NoticeFilters";
import NoticeTable from "../../components/notices/NoticeTable";
import NoticeForm from "../../components/notices/NoticeForm";
import NoticeDetails from "../../components/notices/NoticeDetails";
import NoticeCategoryChart from "../../components/notices/NoticeCategoryChart";
import NoticeTimelineChart from "../../components/notices/NoticeTimelineChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { notices } from "../../mock/notices";

const Notices = () => {
  // Filters

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  // CRUD States

  const [openModal, setOpenModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState(null);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      notice.noticeId
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "" ||
      notice.category === category;

    const matchesPriority =
      priority === "" ||
      notice.priority === priority;

    const matchesStatus =
      status === "" ||
      notice.status === status;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPriority &&
      matchesStatus
    );
  });

  return (
    <Layout
      title="Notice Board"
      breadcrumb={["Home", "Notice Board"]}
    >
      <NoticeStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <NoticeCategoryChart />
        <NoticeTimelineChart />
      </div>

      <NoticeFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        priority={priority}
        setPriority={setPriority}
        status={status}
        setStatus={setStatus}
        onAddNotice={() => {
          setEditingNotice(null);
          setOpenModal(true);
        }}
      />

      <NoticeTable
        notices={filteredNotices}
        onView={setSelectedNotice}
        onEdit={(notice) => {
          setEditingNotice(notice);
          setOpenModal(true);
        }}
        onDelete={setDeleteNotice}
      />

      {/* Add/Edit */}

      <Modal
        open={openModal}
        title={
          editingNotice
            ? "Edit Notice"
            : "Publish Notice"
        }
        onClose={() => {
          setOpenModal(false);
          setEditingNotice(null);
        }}
      >
        <NoticeForm
          initialData={editingNotice}
          onClose={() => {
            setOpenModal(false);
            setEditingNotice(null);
          }}
        />
      </Modal>

      {/* Details */}

      <NoticeDetails
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteNotice}
        title="Delete Notice"
        message={`Delete "${deleteNotice?.title}"?`}
        confirmText="Delete"
        onCancel={() => setDeleteNotice(null)}
        onConfirm={() => {
          console.log(deleteNotice);

          setDeleteNotice(null);
        }}
      />
    </Layout>
  );
};

export default Notices;