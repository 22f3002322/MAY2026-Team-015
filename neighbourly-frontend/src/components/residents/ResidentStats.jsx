import Card from "../ui/Card";
import {
  Users,
  Home,
  UserCheck,
  UserX,
} from "lucide-react";

import useResidentStore from "../../store/residentStore";

const ResidentStats = () => {
  const residents = useResidentStore(
    (state) => state.residents
  );

  const totalResidents = residents.length;

  const owners = residents.filter(
    (resident) => resident.occupancy === "Owner"
  ).length;

  const tenants = residents.filter(
    (resident) => resident.occupancy === "Tenant"
  ).length;

  const inactive = residents.filter(
    (resident) => resident.status === "Inactive"
  ).length;

  const stats = [
    {
      title: "Total Residents",
      value: totalResidents,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Owners",
      value: owners,
      icon: Home,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tenants",
      value: tenants,
      icon: UserCheck,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Inactive",
      value: inactive,
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {item.value}
                </h2>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}
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