import Skeleton from "./Skeleton";

const CardSkeleton = ({
  lines = 3,
}) => {

  return (

    <div
      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
      dark:border-slate-700
      dark:bg-slate-900
      "
    >

      {/* Header */}

      <div
        className="
        mb-6
        flex
        items-center
        justify-between
        "
      >

        <Skeleton
          className="
          h-6
          w-40
          "
        />

        <Skeleton
          className="
          h-10
          w-10
          rounded-full
          "
        />

      </div>

      {/* Content */}

      <div
        className="
        space-y-4
        "
      >

        {

          Array.from({
            length: lines,
          }).map((_, index) => (

            <Skeleton

              key={index}

              className={`
              h-4

              ${
                index === lines - 1
                  ? "w-3/4"
                  : "w-full"
              }

              `}

            />

          ))

        }

      </div>

    </div>

  );

};

export default CardSkeleton;