import {
  Building2,
  Home,
  CheckCircle,
  CircleOff,
} from "lucide-react";

import Card from "../ui/Card";

const stats = [
  {
    title: "Total Flats",
    value: 240,
    icon: Home,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Occupied",
    value: 198,
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Vacant",
    value: 42,
    icon: CircleOff,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Blocks",
    value: 8,
    icon: Building2,
    color: "bg-purple-100 text-purple-600",
  },
];

const ApartmentStats = () => {
  return (
    <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

export default ApartmentStats;