import {
  Bell,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import Card from "../../ui/Card";

import useNoticeStore from "../../../store/noticeStore";

const NoticeStats = () => {
  const notices = useNoticeStore(
    (state) => state.notices
  );

  const total = notices.length;

  const published = notices.filter(
    (notice) =>
      notice.status === "Published"
  ).length;

  const draft = notices.filter(
    (notice) =>
      notice.status === "Draft"
  ).length;

  const highPriority = notices.filter(
    (notice) =>
      notice.priorityValue === "high" ||
      notice.priorityValue === "urgent" ||
      notice.priority === "High" ||
      notice.priority === "Urgent"
  ).length;

  const stats = [
    {
      title: "Total Notices",
      value: total,
      icon: Bell,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Published",
      value: published,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Draft",
      value: draft,
      icon: Clock3,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "High / Urgent",
      value: highPriority,
      icon: AlertTriangle,
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