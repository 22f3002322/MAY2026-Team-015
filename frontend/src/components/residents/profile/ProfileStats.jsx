import {
  CalendarDays,
  Car,
  Users,
  Home,
} from "lucide-react";

import Card from "../../ui/Card";

import useProfileStore from "../../../store/profileStore";

const ProfileStats = () => {
  const profile = useProfileStore(
    (state) => state.profile
  );

  const stats = [
    {
      title: "Resident Since",
      value: profile.joined,
      icon: CalendarDays,
      color:
        "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Vehicles",
      value: profile.vehicleDetails.length,
      icon: Car,
      color:
        "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Family Members",
      value: profile.familyDetails.length,
      icon: Users,
      color:
        "bg-amber-100 text-amber-600",
    },
    {
      title: "Flat",
      value: `${profile.block}-${profile.flat}`,
      icon: Home,
      color:
        "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-2xl font-bold text-slate-800 dark:text-slate-100 break-words">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${item.color}`}
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

export default ProfileStats;