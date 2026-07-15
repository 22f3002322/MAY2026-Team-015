import {
  CalendarDays,
  Tag,
  Eye,
  AlertTriangle,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const NoticeCard = ({
  notice,
  onView,
}) => {
  const priorityVariant = {
    High: "danger",
    Medium: "warning",
    Low: "success",
  };

  return (
    <Card className="flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Header */}

      <div className="mb-5 flex items-start justify-between gap-3">

        <div className="flex-1">

          <h3 className="line-clamp-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            {notice.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            #{notice.noticeId}
          </p>

        </div>

        <Badge
          variant={
            priorityVariant[
              notice.priority
            ] || "default"
          }
        >
          <AlertTriangle
            size={14}
          />

          {notice.priority}
        </Badge>

      </div>

      {/* Category */}

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">

        <Tag
          size={16}
          className="text-indigo-600"
        />

        {notice.category}

      </div>

      {/* Description */}

      <p className="line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {notice.description}
      </p>

      {/* Dates */}

      <div className="mt-6 space-y-2 border-t pt-4">

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

          <CalendarDays
            size={16}
          />

          <span>
            Published :
            {" "}
            {notice.publishDate}
          </span>

        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

          <CalendarDays
            size={16}
          />

          <span>
            Expires :
            {" "}
            {notice.expiryDate}
          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6">

        <Button
          className="w-full"
          onClick={() =>
            onView(notice)
          }
        >
          <Eye size={18} />

          View Details
        </Button>

      </div>

    </Card>
  );
};

export default NoticeCard;