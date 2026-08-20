import {
  Plus,
  UserPlus,
  CalendarPlus,
  UserRoundPlus,
  Shield,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

const QuickActions = ({
  onRaiseComplaint,
  onAddResident,
  onRegisterVisitor,
  onBookFacility,
  onAddCommittee,   // Admin-only — omit prop to hide
}) => {
  const actions = [
    ...(onRaiseComplaint
      ? [{ title: "Complaints Summary", icon: Plus, onClick: onRaiseComplaint }]
      : []),
    ...(onAddResident
      ? [{ title: "Add Resident", icon: UserPlus, onClick: onAddResident }]
      : []),
    ...(onRegisterVisitor
      ? [{ title: "Register Visitor", icon: UserRoundPlus, onClick: onRegisterVisitor }]
      : []),
    ...(onBookFacility
      ? [{ title: "Booked Facilities Summary", icon: CalendarPlus, onClick: onBookFacility }]
      : []),
    ...(onAddCommittee
      ? [{ title: "Add Committee", icon: Shield, onClick: onAddCommittee, highlight: true }]
      : []),
];

  return (
    <Card
      title="Quick Actions"
      subtitle="Frequently used actions"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.title}
              variant="outline"
              className={`h-14 justify-start ${
                action.highlight
                  ? "border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/30"
                  : ""
              }`}
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