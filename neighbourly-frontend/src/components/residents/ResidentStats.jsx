import Card from "../ui/Card";
import { Users, Home, UserCheck, UserX } from "lucide-react";

const stats = [
  {
    title: "Total Residents",
    value: 128,
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Owners",
    value: 86,
    icon: Home,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Tenants",
    value: 42,
    icon: UserCheck,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Inactive",
    value: 7,
    icon: UserX,
    color: "bg-red-100 text-red-600",
  },
];

const ResidentStats = () => {
  return (
    <div className="grid gap-5 mb-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {item.value}
                </h2>
              </div>

              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={28} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ResidentStats;