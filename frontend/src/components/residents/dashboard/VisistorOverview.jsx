import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import VisitorDetails from "../visitors/VisitorDetails";
import useVisitorStore from "../../../store/visitorStore";

const todayLocal = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const statusVariant = (statusValue, status) => {
  const v = String(statusValue || status || "").toLowerCase();
  if (v === "expected") return "warning";
  if (v === "arrived") return "primary";
  if (v === "denied") return "danger";
  if (v === "departed") return "success";
  return "default";
};

const VisitorOverview = () => {
  const visitors = useVisitorStore((state) => state.visitors);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const today = todayLocal();

  const myVisitors = useMemo(() => {
    return [...visitors]
      .filter((visitor) => {
        const status = String(
          visitor.statusValue || visitor.status || ""
        ).toLowerCase();
        if (status !== "expected") return false;
        const date = String(visitor.date || visitor.expected_date || "").slice(
          0,
          10
        );
        return date >= today;
      })
      .sort((a, b) => {
        const aKey = `${a.date || ""}T${a.visitTime || "00:00"}`;
        const bKey = `${b.date || ""}T${b.visitTime || "00:00"}`;
        return new Date(aKey) - new Date(bKey);
      })
      .slice(0, 5)
      .map((v) => ({
        ...v,
        // Never surface OTP hashes on the dashboard
        otp: null,
      }));
  }, [visitors, today]);

  return (
    <>
      <Card
        title="Upcoming Visitors"
        subtitle="Expected visitors from today onward"
      >
        <div className="space-y-4">
          {myVisitors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-700">
              <UserRound size={42} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500">No visitors scheduled.</p>
            </div>
          ) : (
            myVisitors.map((visitor) => (
              <div
                key={visitor.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                    {visitor.name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {visitor.purpose}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {visitor.date} • {visitor.visitTime}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={statusVariant(visitor.statusValue, visitor.status)}
                  >
                    {visitor.status || "Expected"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVisitor(visitor)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />
    </>
  );
};

export default VisitorOverview;
