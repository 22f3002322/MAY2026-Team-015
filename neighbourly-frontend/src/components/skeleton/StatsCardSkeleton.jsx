import Skeleton from "./Skeleton";

const StatsCardSkeleton = () => {

  return (

    <div
      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      dark:border-slate-700
      dark:bg-slate-900
      "
    >

      <div
        className="
        flex
        items-start
        justify-between
        "
      >

        <div
          className="
          flex-1
          space-y-3
          "
        >

          {/* Title */}

          <Skeleton
            className="
            h-4
            w-24
            "
          />

          {/* Number */}

          <Skeleton
            className="
            h-8
            w-20
            "
          />

          {/* Footer */}

          <Skeleton
            className="
            h-3
            w-32
            "
          />

        </div>

        {/* Icon */}

        <Skeleton
          className="
          h-12
          w-12
          rounded-xl
          "
        />

      </div>

    </div>

  );

};

export default StatsCardSkeleton;