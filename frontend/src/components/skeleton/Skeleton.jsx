import clsx from "clsx";

const Skeleton = ({
  className = "",
}) => {

  return (

    <div
      className={clsx(
        "animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700",
        className
      )}
    />

  );

};

export default Skeleton;