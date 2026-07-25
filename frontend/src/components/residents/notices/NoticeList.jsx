import { Bell } from "lucide-react";

import NoticeCard from "./NoticeCard";

const NoticeList = ({
  notices,
  onView,
}) => {
  if (notices.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">

        <div className="rounded-full bg-indigo-100 p-5">

          <Bell
            size={42}
            className="text-indigo-600"
          />

        </div>

        <h2 className="mt-5 text-xl font-semibold text-slate-800">
          No Notices Found
        </h2>

        <p className="mt-2 max-w-md text-slate-500">
          There are no notices matching your
          current filters. Try changing the
          search or filter options.
        </p>

      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default NoticeList;