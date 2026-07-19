import { useMemo } from "react";
import { Bell } from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useNoticeStore from "../../../store/noticeStore";

const NoticeOverview = () => {
  const notices = useNoticeStore(
    (state) => state.notices
  );

  const latestNotices = useMemo(() => {
    return [...notices]
      .filter(
        (notice) => notice.status === "Published"
      )
      .sort(
        (a, b) =>
          new Date(b.publishDate) -
          new Date(a.publishDate)
      )
      .slice(0, 5);
  }, [notices]);

  const getVariant = (priority) => {
    switch (priority) {
      case "High":
        return "danger";

      case "Medium":
        return "warning";

      case "Low":
        return "success";

      default:
        return "default";
    }
  };

  return (
    <Card
      title="Latest Notices"
      subtitle="Society announcements"
    >
      {latestNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Bell
            size={42}
            className="mb-3 text-slate-400"
          />

          <p className="text-slate-500 dark:text-slate-400">
            No notices available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {latestNotices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {notice.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {notice.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="primary">
                      {notice.category}
                    </Badge>

                    <Badge
                      variant={getVariant(
                        notice.priority
                      )}
                    >
                      {notice.priority}
                    </Badge>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Published on{" "}
                    {new Date(
                      notice.publishDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
            >
              View All Notices
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NoticeOverview;