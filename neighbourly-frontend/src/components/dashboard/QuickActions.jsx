import {
  Plus,
  UserPlus,
  CalendarPlus,
  UserRoundPlus,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

const actions = [
  {
    title: "Raise Complaint",
    icon: Plus,
  },
  {
    title: "Add Resident",
    icon: UserPlus,
  },
  {
    title: "Register Visitor",
    icon: UserRoundPlus,
  },
  {
    title: "Book Facility",
    icon: CalendarPlus,
  },
];

const QuickActions = () => {
  return (
    <Card
      title="Quick Actions"
      subtitle="Frequently used actions"
    >
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.title}
              variant="outline"
              className="justify-start h-14"
            >
              <Icon size={18} />
              {action.title}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;