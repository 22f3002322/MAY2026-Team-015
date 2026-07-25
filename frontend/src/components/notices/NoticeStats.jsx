import {
  Bell,
  Megaphone,
  FileText,
  Clock,
} from "lucide-react";

import Card from "../ui/Card";

import useNoticeStore from "../../store/noticeStore";

const NoticeStats = () => {
  const notices = useNoticeStore(
    (state) => state.notices
  );

  const totalNotices = notices.length;

  const published = notices.filter(
    (notice) =>
      notice.status === "Published"
  ).length;

  const drafts = notices.filter(
    (notice) =>
      notice.status === "Draft"
  ).length;

  const today = new Date();

  const expiringSoon = notices.filter(
    (notice) => {
      if (
        !notice.expiryDate ||
        notice.status !== "Published"
      )
        return false;

      const expiry = new Date(
        notice.expiryDate
      );

      const diff =
        (expiry - today) /
        (1000 * 60 * 60 * 24);

      return diff >= 0 && diff <= 7;
    }
  ).length;

  const stats = [
    {
      title: "Total Notices",
      value: totalNotices,
      icon: Bell,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Published",
      value: published,
      icon: Megaphone,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Draft",
      value: drafts,
      icon: FileText,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      icon: Clock,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${item.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default NoticeStats;