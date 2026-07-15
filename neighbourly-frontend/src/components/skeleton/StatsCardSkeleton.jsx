import Skeleton from "./Skeleton";

const StatsCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mb-2 h-8 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};

export default StatsCardSkeleton;
