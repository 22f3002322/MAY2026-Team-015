import {
  Users,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";

import Card from "../ui/Card";

import useStaffStore from "../../store/staffStore";

const StaffStats = () => {
  const staff = useStaffStore(
    (state) => state.staff
  );

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeave = staff.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const inactive = staff.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const stats = [
    {
      title: "Total Staff",
      value: totalStaff,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active",
      value: activeStaff,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "On Leave",
      value: onLeave,
      icon: UserMinus,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Inactive",
      value: inactive,
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
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

export default StaffStats;