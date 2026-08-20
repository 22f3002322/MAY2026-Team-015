import { Users, UserCheck, CheckCircle2, History } from "lucide-react";
import Card from "../ui/Card";
import useVisitorStore from "../../store/visitorStore";

const VisitorStats = () => {
  const logs = useVisitorStore((state) => state.logs);

  const today = new Date().toISOString().split("T")[0];

  const todaysVisitors = logs.filter(
    (log) => log.entry_time && log.entry_time.split("T")[0] === today
  ).length;

  const checkedIn = logs.filter((log) => log.entry_time && !log.exit_time).length;
  const completed = logs.filter((log) => !!log.exit_time).length;

  const stats = [
    { title: "Today's Visitors", value: todaysVisitors, icon: Users },
    { title: "Checked In", value: checkedIn, icon: UserCheck },
    { title: "Completed Visits", value: completed, icon: CheckCircle2 },
    { title: "Total Logs", value: logs.length, icon: History },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">{item.value}</h2>
              </div>
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default VisitorStats;