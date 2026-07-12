import {
  Calendar,
  Users,
  Vote,
  Tag,
  Clock,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const PollDetails = ({
  poll,
  onClose,
}) => {
  if (!poll) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";

      case "Upcoming":
        return "warning";

      case "Closed":
        return "secondary";

      default:
        return "default";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Poll Details
            </h2>

            <p className="text-sm text-slate-500">
              {poll.pollId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="space-y-8 p-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              {poll.question}
            </h3>

            <div className="mt-3">
              <Badge
                variant={getStatusVariant(
                  poll.status
                )}
              >
                {poll.status}
              </Badge>
            </div>
          </div>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6">
            <Info
              icon={Tag}
              label="Category"
              value={poll.category}
            />

            <Info
              icon={Users}
              label="Total Votes"
              value={poll.totalVotes}
            />

            <Info
              icon={Calendar}
              label="Start Date"
              value={poll.startDate}
            />

            <Info
              icon={Calendar}
              label="End Date"
              value={poll.endDate}
            />

            <Info
              icon={Vote}
              label="Options"
              value={poll.options.length}
            />

            <Info
              icon={Clock}
              label="Status"
              value={poll.status}
            />
          </div>

          {/* Poll Results */}

          <div>
            <h4 className="mb-5 text-lg font-semibold text-slate-800">
              Poll Results
            </h4>

            <div className="space-y-5">
              {poll.options.map(
                (item, index) => {
                  const percentage =
                    poll.totalVotes === 0
                      ? 0
                      : Math.round(
                          (item.votes /
                            poll.totalVotes) *
                            100
                        );

                  return (
                    <div
                      key={index}
                    >
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {item.option}
                        </span>

                        <span className="text-slate-500">
                          {item.votes} votes
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 flex justify-between text-xs text-slate-500">
                        <span>
                          {percentage}% of
                          total votes
                        </span>

                        <span>
                          {item.votes}/
                          {poll.totalVotes}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Dates */}

          {(poll.createdAt ||
            poll.updatedAt) && (
            <div className="rounded-xl border bg-slate-50 p-4">
              <h4 className="mb-3 font-semibold text-slate-800">
                Activity
              </h4>

              <div className="space-y-2 text-sm">
                {poll.createdAt && (
                  <p>
                    <span className="font-medium">
                      Created:
                    </span>{" "}
                    {new Date(
                      poll.createdAt
                    ).toLocaleString()}
                  </p>
                )}

                {poll.updatedAt && (
                  <p>
                    <span className="font-medium">
                      Last Updated:
                    </span>{" "}
                    {new Date(
                      poll.updatedAt
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

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
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex gap-3">
    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>

    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="font-medium text-slate-800">
        {value}
      </p>
    </div>
  </div>
);

export default PollDetails;