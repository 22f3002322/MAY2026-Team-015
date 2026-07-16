import Skeleton from "./Skeleton";

const FormSkeleton = ({
  fields = 6,
  columns = 2,
  showTitle = true,
  showButtons = true,
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

      {/* Title */}

      {

        showTitle && (

          <div className="mb-8">

            <Skeleton
              className="h-7 w-56"
            />

            <Skeleton
              className="mt-3 h-4 w-80"
            />

          </div>

        )

      }

      {/* Fields */}

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns:
            `repeat(${columns}, minmax(0,1fr))`,
        }}
      >

        {

          Array.from({
            length: fields,
          }).map((_, index) => (

            <div
              key={index}
              className="space-y-3"
            >

              <Skeleton
                className="h-4 w-28"
              />

              <Skeleton
                className="h-11 w-full rounded-xl"
              />

            </div>

          ))

        }

      </div>

      {/* Buttons */}

      {

        showButtons && (

          <div
            className="
            mt-8
            flex
            justify-end
            gap-4
            "
          >

            <Skeleton
              className="
              h-11
              w-28
              rounded-xl
              "
            />

            <Skeleton
              className="
              h-11
              w-36
              rounded-xl
              "
            />

          </div>

        )

      }

    </div>

  );

};

export default FormSkeleton;