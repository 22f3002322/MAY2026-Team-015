import {
  Users,
  Home,
  UserCheck,
  UserX,
} from "lucide-react";

import Card from "../ui/Card";

import useResidentStore from "../../store/residentStore";

const ResidentStats = () => {
  const residents = useResidentStore(
    (state) => state.residents
  );

  const stats = [
    {
      title: "Total Residents",
      value: residents.length,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Owners",
      value: residents.filter(
        (resident) =>
          resident.occupancy === "Owner"
      ).length,
      icon: Home,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Tenants",
      value: residents.filter(
        (resident) =>
          resident.occupancy === "Tenant"
      ).length,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Active Residents",
      value: residents.filter(
        (resident) =>
          resident.status === "Active"
      ).length,
      icon: UserX,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${item.bg} ${item.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ResidentStats;