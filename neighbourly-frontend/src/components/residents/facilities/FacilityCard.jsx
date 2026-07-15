import {
  MapPin,
  Clock3,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const FacilityCard = ({
  facility,
  onBook,
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Facility Image */}

      <img
        src={facility.image}
        alt={facility.name}
        className="h-52 w-full object-cover"
      />

      <div className="p-6">

        {/* Header */}

        <div className="mb-4 flex items-start justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {facility.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {facility.category}
            </p>

          </div>

          <Badge
            variant={
              facility.available
                ? "success"
                : "danger"
            }
          >
            {facility.available ? (
              <>
                <CheckCircle2 size={14} />

                Available
              </>
            ) : (
              <>
                <XCircle size={14} />

                Closed
              </>
            )}
          </Badge>

        </div>

        {/* Description */}

        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {facility.description}
        </p>

        {/* Information */}

        <div className="mt-6 space-y-3">

          <div className="flex items-center gap-3">

            <MapPin
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm text-slate-700 dark:text-slate-200">
              {facility.location}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Clock3
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm text-slate-700 dark:text-slate-200">
              {facility.timings}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Users
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm text-slate-700 dark:text-slate-200">
              Capacity : {facility.capacity}
            </span>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-6">

          <Button
            disabled={!facility.available}
            onClick={() =>
              onBook(facility)
            }
            className="w-full"
          >
            <CalendarDays size={18} />

            {facility.bookingRequired
              ? "Book Facility"
              : "Visit Facility"}
          </Button>

        </div>

      </div>

    </Card>
  );
};

export default FacilityCard;