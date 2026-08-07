import { useMemo, useState, useEffect } from "react";

import Layout from "../../components/layout/Layout";

import NoticeStats from "../../components/residents/notices/NoticeStats";
import NoticeFilters from "../../components/residents/notices/NoticeFilters";
import NoticeList from "../../components/residents/notices/NoticeList";
import NoticeDetails from "../../components/residents/notices/NoticeDetails";

import useNoticeStore from "../../store/noticeStore";

const Notices = () => {
  const { notices, fetchAnnouncements } = useNoticeStore();

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [
    selectedNotice,
    setSelectedNotice,
  ] = useState(null);

  const filteredNotices =
    useMemo(() => {
      let filtered = [...notices];

      // Search

      if (search.trim()) {
        const query =
          search.toLowerCase();

        filtered = filtered.filter(
          (notice) =>
            notice.title
              .toLowerCase()
              .includes(query) ||
            notice.description
              .toLowerCase()
              .includes(query) ||
            notice.noticeId
              .toLowerCase()
              .includes(query)
        );
      }

      // Category

      if (category) {
        filtered =
          filtered.filter(
            (notice) =>
              notice.category ===
              category
          );
      }

      // Priority

      if (priority) {
        filtered =
          filtered.filter(
            (notice) =>
              notice.priority ===
              priority
          );
      }

      // Sort

      filtered.sort((a, b) => {
        const dateA = new Date(
          a.publishDate
        );

        const dateB = new Date(
          b.publishDate
        );

        return sort === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });

      return filtered;
    }, [
      notices,
      search,
      category,
      priority,
      sort,
    ]);

  return (
    <Layout
      title="Society Notices"
      breadcrumb={[
        "Resident",
        "Notices",
      ]}
    >
      <NoticeStats />

      <NoticeFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        priority={priority}
        setPriority={setPriority}
        sort={sort}
        setSort={setSort}
      />

      <NoticeList
        notices={filteredNotices}
        onView={setSelectedNotice}
      />

      <NoticeDetails
        notice={selectedNotice}
        onClose={() =>
          setSelectedNotice(null)
        }
      />
    </Layout>
  );
};

export default Notices;