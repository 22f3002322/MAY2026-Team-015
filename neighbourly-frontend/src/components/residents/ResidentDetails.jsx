import Badge from "../ui/Badge";
import Button from "../ui/Button";

const ResidentDetails = ({
  resident,
  onClose,
}) => {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">

      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">

        <div className="border-b p-6">

          <h2 className="text-2xl font-semibold">
            Resident Details
          </h2>

        </div>

        <div className="space-y-6 p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {resident.name.charAt(0)}
            </div>

            <div>

              <h3 className="text-xl font-semibold">
                {resident.name}
              </h3>

              <p className="text-slate-500">
                {resident.email}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Info
              label="Phone"
              value={resident.phone}
            />

            <Info
              label="Flat"
              value={resident.flat}
            />

            <Info
              label="Block"
              value={resident.block}
            />

            <Info
              label="Occupancy"
              value={resident.occupancy}
            />

            <Info
              label="Joined"
              value={resident.joined}
            />

            <div>
              <p className="mb-1 text-sm text-slate-500">
                Status
              </p>

              <Badge
                variant={
                  resident.status === "Active"
                    ? "success"
                    : "danger"
                }
              >
                {resident.status}
              </Badge>

            </div>

          </div>

          <div className="pt-4">

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

    </div>
  );
};

const Info = ({
  label,
  value,
}) => (
  <div>
    <p className="mb-1 text-sm text-slate-500">
      {label}
    </p>

    <p className="font-medium">
      {value}
    </p>
  </div>
);

export default ResidentDetails;