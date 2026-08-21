import { useMemo, useState, useEffect } from "react";

import Layout from "../../components/layout/Layout";
import NoticeStats from "../../components/residents/notices/NoticeStats";
import NoticeFilters from "../../components/residents/notices/NoticeFilters";
import NoticeList from "../../components/residents/notices/NoticeList";
import NoticeDetails from "../../components/residents/notices/NoticeDetails";

import useNoticeStore from "../../store/noticeStore";
import { NOTICE_PRIORITY, labelFor } from "../../utils/adminMaps";

const Notices = () => {
  const { notices, fetchAnnouncements } = useNoticeStore();

  useEffect(() => {
    fetchAnnouncements(false);
  }, [fetchAnnouncements]);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedNotice, setSelectedNotice] = useState(null);

  const filteredNotices = useMemo(() => {
    let filtered = [...notices];

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (notice) =>
          String(notice.title || "").toLowerCase().includes(query) ||
          String(notice.description || "").toLowerCase().includes(query) ||
          String(notice.noticeId || "").toLowerCase().includes(query)
      );
    }

    if (priority) {
      filtered = filtered.filter(
        (notice) =>
          notice.priorityValue === priority ||
          notice.priority === labelFor(NOTICE_PRIORITY, priority)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.publishDate || 0);
      const dateB = new Date(b.publishDate || 0);
      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [notices, search, priority, sort]);

  return (
    <Layout title="Society Notices" breadcrumb={["Resident", "Notices"]}>
      <NoticeStats />

      <NoticeFilters
        search={search}
        setSearch={setSearch}
        priority={priority}
        setPriority={setPriority}
        sort={sort}
        setSort={setSort}
      />

      <NoticeList notices={filteredNotices} onView={setSelectedNotice} />

      <NoticeDetails
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </Layout>
  );
};

export default Notices;
