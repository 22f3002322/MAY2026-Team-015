import { useMemo } from "react";
import { UserRound } from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useVisitorStore from "../../../store/visitorStore";
import useResidentStore from "../../../store/residentStore";

const VisitorOverview = () => {
  const visitors = useVisitorStore(
    (state) => state.visitors
  );

  const resident = useResidentStore(
    (state) => state.residents[0]
  );

  const myVisitors = useMemo(
    () =>
      visitors
        .filter(
          (visitor) =>
            visitor.residentFlat === resident?.flat
        )
        .sort(
          (a, b) =>
            new Date(
              `${b.visitDate} ${b.visitTime}`
            ) -
            new Date(
              `${a.visitDate} ${a.visitTime}`
            )
        )
        .slice(0, 5),
    [visitors, resident]
  );

  return (
    <Card
      title="Upcoming Visitors"
      subtitle="Recent visitor approvals"
    >
      <div className="space-y-4">
        {myVisitors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
            <UserRound
              size={42}
              className="mx-auto mb-3 text-slate-400"
            />

            <p className="text-slate-500">
              No visitors scheduled.
            </p>
          </div>
        ) : (
          myVisitors.map((visitor) => {
            let variant = "default";

            switch (visitor.status) {
              case "Approved":
                variant = "success";
                break;

              case "Pending":
                variant = "warning";
                break;

              case "Rejected":
                variant = "danger";
                break;

              default:
                variant = "default";
            }

            return (
              <div
                key={visitor.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {visitor.visitorName}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {visitor.purpose}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {visitor.visitDate} •{" "}
                    {visitor.visitTime}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={variant}>
                    {visitor.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Details
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default VisitorOverview;