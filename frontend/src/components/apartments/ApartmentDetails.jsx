import Badge from "../ui/Badge";
import Button from "../ui/Button";

const ApartmentDetails = ({
  apartment,
  onClose,
}) => {
  if (!apartment) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">

        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Apartment Details
          </h2>
        </div>

        <div className="space-y-6 p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {apartment.flat}
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {apartment.flat}
              </h3>

              <p className="text-slate-500 dark:text-slate-400">
                {apartment.owner}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-5">

            <Info
              label="Block"
              value={apartment.block}
            />

            <Info
              label="Floor"
              value={apartment.floor}
            />

            <Info
              label="Flat Type"
              value={apartment.type}
            />

            <div>
              <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                Occupancy
              </p>

              <Badge
                variant={
                  apartment.occupancy === "Occupied"
                    ? "success"
                    : "warning"
                }
              >
                {apartment.occupancy}
              </Badge>
            </div>

          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>

        </div>

      </div>

    </div>
  );
};

const Info = ({
  label,
  value,
}) => (
  <div>
    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <p className="font-medium text-slate-800 dark:text-slate-100">
      {value}
    </p>
  </div>
);

export default ApartmentDetails;