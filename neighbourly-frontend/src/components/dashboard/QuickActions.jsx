import {
  Plus,
  UserPlus,
  CalendarPlus,
  UserRoundPlus,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

const QuickActions = ({
  onRaiseComplaint,
  onAddResident,
  onRegisterVisitor,
  onBookFacility,
}) => {
  const actions = [
    {
      title: "Raise Complaint",
      icon: Plus,
      onClick: onRaiseComplaint,
    },
    {
      title: "Add Resident",
      icon: UserPlus,
      onClick: onAddResident,
    },
    {
      title: "Register Visitor",
      icon: UserRoundPlus,
      onClick: onRegisterVisitor,
    },
    {
      title: "Book Facility",
      icon: CalendarPlus,
      onClick: onBookFacility,
    },
  ];

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
              className="h-14 justify-start"
              onClick={action.onClick}
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