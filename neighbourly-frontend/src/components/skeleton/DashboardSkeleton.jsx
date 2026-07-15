import StatsCardSkeleton from "./StatsCardSkeleton";
import CardSkeleton from "./CardSkeleton";
import TableSkeleton from "./TableSkeleton";

const DashboardSkeleton = ({
  stats = 4,
}) => {

  return (

    <div
      className="
      space-y-6
      "
    >

      {/* Page Title */}

      <div
        className="
        space-y-2
        "
      >

        <div
          className="
          h-8
          w-64
          animate-pulse
          rounded-lg
          bg-slate-200
          dark:bg-slate-700
          "
        />

        <div
          className="
          h-4
          w-96
          animate-pulse
          rounded-lg
          bg-slate-200
          dark:bg-slate-700
          "
        />

      </div>

      {/* Stats */}

      <div
        className="
        grid
        gap-6
        sm:grid-cols-2
        xl:grid-cols-4
        "
      >

        {

          Array.from({
            length: stats,
          }).map((_, index) => (

            <StatsCardSkeleton
              key={index}
            />

          ))

        }

      </div>

      {/* Charts */}

      <div
        className="
        grid
        gap-6
        lg:grid-cols-2
        "
      >

        <CardSkeleton
          lines={6}
        />

        <CardSkeleton
          lines={6}
        />

      </div>

      {/* Recent Activity */}

      <CardSkeleton
        lines={5}
      />

      {/* Recent Table */}

      <TableSkeleton
        rows={6}
        columns={6}
      />

    </div>

  );

};

export default DashboardSkeleton;