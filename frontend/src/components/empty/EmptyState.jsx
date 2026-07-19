import Button from "../ui/Button";

const EmptyState = ({
  icon: Icon,
  title = "Nothing here",
  description = "There is no data to display.",
  actionLabel,
  onAction,
}) => {

  return (

    <div
      className="
      flex
      flex-col
      items-center
      justify-center
      rounded-2xl
      border
      border-dashed
      border-slate-300
      bg-white
      px-6
      py-16
      text-center
      shadow-sm
      dark:border-slate-700
      dark:bg-slate-900
      "
    >

      {

        Icon && (

          <div
            className="
            mb-5
            rounded-full
            bg-indigo-100
            p-5
            dark:bg-slate-800
            "
          >

            <Icon
              size={42}
              className="
              text-indigo-600
              dark:text-indigo-400
              "
            />

          </div>

        )

      }

      <h2
        className="
        text-2xl
        font-semibold
        "
      >
        {title}
      </h2>

      <p
        className="
        mt-3
        max-w-md
        text-slate-500
        dark:text-slate-400
        "
      >
        {description}
      </p>

      {

        actionLabel && (

          <Button
            onClick={onAction}
            className="mt-8"
          >
            {actionLabel}
          </Button>

        )

      }

    </div>

  );

};

export default EmptyState;