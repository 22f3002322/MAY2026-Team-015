import Skeleton from "./Skeleton";

const TableSkeleton = ({
  rows = 6,
  columns = 6,
  showHeader = true,
}) => {

  return (

    <div
      className="
      overflow-hidden
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
      dark:border-slate-700
      dark:bg-slate-900
      "
    >

      {/* Header */}

      {

        showHeader && (

          <div
            className="
            grid
            gap-4
            border-b
            border-slate-200
            p-4
            dark:border-slate-700
            "
            style={{
              gridTemplateColumns:
                `repeat(${columns}, minmax(0,1fr))`,
            }}
          >

            {

              Array.from({
                length: columns,
              }).map((_, index) => (

                <Skeleton
                  key={index}
                  className="
                  h-4
                  w-3/4
                  "
                />

              ))

            }

          </div>

        )

      }

      {/* Rows */}

      {

        Array.from({
          length: rows,
        }).map((_, rowIndex) => (

          <div

            key={rowIndex}

            className="
            grid
            gap-4
            border-b
            border-slate-100
            p-4
            last:border-none
            dark:border-slate-800
            "

            style={{
              gridTemplateColumns:
                `repeat(${columns}, minmax(0,1fr))`,
            }}

          >

            {

              Array.from({
                length: columns,
              }).map((_, columnIndex) => (

                <Skeleton

                  key={columnIndex}

                  className={`
                  h-4

                  ${
                    columnIndex === 0
                      ? "w-full"
                      : "w-3/4"
                  }

                  `}

                />

              ))

            }

          </div>

        ))

      }

    </div>

  );

};

export default TableSkeleton;