import Skeleton from "./Skeleton";

const ProfileSkeleton = () => {

  return (

    <div className="space-y-6">

      {/* Profile Header */}

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

        <div
          className="
          flex
          flex-col
          items-center
          gap-5
          md:flex-row
          "
        >

          {/* Avatar */}

          <Skeleton
            className="
            h-28
            w-28
            rounded-full
            "
          />

          {/* User Info */}

          <div className="flex-1 space-y-3">

            <Skeleton
              className="h-8 w-52"
            />

            <Skeleton
              className="h-5 w-40"
            />

            <Skeleton
              className="h-4 w-72"
            />

            <Skeleton
              className="h-4 w-60"
            />

          </div>

          {/* Button */}

          <Skeleton
            className="
            h-11
            w-36
            rounded-xl
            "
          />

        </div>

      </div>

      {/* Information Cards */}

      <div
        className="
        grid
        gap-6
        lg:grid-cols-2
        "
      >

        {

          Array.from({
            length: 4,
          }).map((_, index) => (

            <div

              key={index}

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

              <Skeleton
                className="
                mb-6
                h-6
                w-40
                "
              />

              <div className="space-y-4">

                {

                  Array.from({
                    length: 4,
                  }).map((_, row) => (

                    <div
                      key={row}
                      className="
                      flex
                      items-center
                      justify-between
                      "
                    >

                      <Skeleton
                        className="h-4 w-24"
                      />

                      <Skeleton
                        className="h-4 w-36"
                      />

                    </div>

                  ))

                }

              </div>

            </div>

          ))

        }

      </div>

    </div>

  );

};

export default ProfileSkeleton;