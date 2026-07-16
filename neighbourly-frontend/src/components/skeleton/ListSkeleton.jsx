import Skeleton from "./Skeleton";

const ListSkeleton = ({
  items = 6,
  avatar = true,
  action = false,
}) => {

  return (

    <div
      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
      dark:border-slate-700
      dark:bg-slate-900
      "
    >

      {

        Array.from({
          length: items,
        }).map((_, index) => (

          <div

            key={index}

            className="
            flex
            items-center
            gap-4
            border-b
            border-slate-100
            p-4
            last:border-none
            dark:border-slate-800
            "

          >

            {/* Avatar/Icon */}

            {

              avatar && (

                <Skeleton
                  className="
                  h-12
                  w-12
                  rounded-full
                  "
                />

              )

            }

            {/* Content */}

            <div
              className="
              flex-1
              space-y-3
              "
            >

              <Skeleton
                className="
                h-5
                w-1/2
                "
              />

              <Skeleton
                className="
                h-4
                w-3/4
                "
              />

            </div>

            {/* Action */}

            {

              action && (

                <Skeleton
                  className="
                  h-10
                  w-24
                  rounded-lg
                  "
                />

              )

            }

          </div>

        ))

      }

    </div>

  );

};

export default ListSkeleton;