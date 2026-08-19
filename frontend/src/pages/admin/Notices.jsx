import { useState, useEffect } from "react";
import { toast } from "sonner";

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

import useNoticeStore from "../../store/noticeStore";

const Notices = () => {
  const notices = useNoticeStore((state) => state.notices);
  const deleteNoticeById = useNoticeStore((state) => state.deleteNotice);
  const fetchAnnouncements = useNoticeStore((state) => state.fetchAnnouncements);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState(null);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(search.toLowerCase()) ||
      notice.noticeId?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priority === "" || notice.priority === priority;
    const matchesStatus = status === "" || notice.status === status;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteNotice) return;
    const res = await deleteNoticeById(deleteNotice.id);
    if (res?.success === false) {
      toast.error(res.message || "Delete failed.");
      return;
    }
    toast.success("Notice deleted.");
    setDeleteNotice(null);
  };

  return (
    <Layout title="Notice Board" breadcrumb={["Home", "Notice Board"]}>
      <NoticeStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <NoticeCategoryChart />
        <NoticeTimelineChart />
      </div>

      <NoticeFilters
        search={search}
        setSearch={setSearch}
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

      <Modal
        open={openModal}
        title={editingNotice ? "Edit Notice" : "Publish Notice"}
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

      <NoticeDetails notice={selectedNotice} onClose={() => setSelectedNotice(null)} />

      <ConfirmDialog
        open={!!deleteNotice}
        title="Delete Notice"
        message={`Delete "${deleteNotice?.title}"?`}
        confirmText="Delete"
        onCancel={() => setDeleteNotice(null)}
        onConfirm={handleDelete}
      />
    </Layout>
  );
};

export default Notices;
