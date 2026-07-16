import {
  Bell,
  ShieldCheck,
  Phone,
  LifeBuoy,
} from "lucide-react";

import Card from "../../ui/Card";

import useSettingsStore from "../../../store/settingsStore";

const SettingsStats = () => {
  const notifications = useSettingsStore((state) => state.notifications);
  const security = useSettingsStore((state) => state.security);
  const emergencyContactsList = useSettingsStore((state) => state.emergencyContacts);
  const supportTickets = useSettingsStore((state) => state.supportTickets);

  const notificationsEnabled = Object.values(notifications).filter(Boolean).length;
  const totalNotifications = Object.keys(notifications).length;

  const activeTickets = supportTickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const emergencyContacts = emergencyContactsList.length;

  const securityEnabled = security.twoFactor ? "Enabled" : "Disabled";

  const stats = [
    {
      title: "Notifications",
      value: `${notificationsEnabled}/${totalNotifications}`,
      icon: Bell,
      color:
        "bg-blue-100 text-blue-600",
    },
    {
      title: "2FA Security",
      value: securityEnabled,
      icon: ShieldCheck,
      color:
        "bg-green-100 text-green-600",
    },
    {
      title: "Emergency Contacts",
      value: emergencyContacts,
      icon: Phone,
      color:
        "bg-red-100 text-red-600",
    },
    {
      title: "Open Tickets",
      value: activeTickets,
      icon: LifeBuoy,
      color:
        "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div
      className="
      mb-6
      grid
      gap-6
      sm:grid-cols-2
      xl:grid-cols-4
      "
    >
      {stats.map((item) => (
        <Card key={item.title}>
          <div
            className="
            flex
            items-center
            justify-between
            "
          >
            <div>
              <p
                className="
                text-sm
                text-slate-500 dark:text-slate-400
                "
              >
                {item.title}
              </p>

              <h2
                className="
                mt-3
                text-3xl
                font-bold
                text-slate-800 dark:text-slate-100
                "
              >
                {item.value}
              </h2>
            </div>

            <div
              className={`
              rounded-xl
              p-3
              ${item.color}
              `}
            >
              <item.icon size={25} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SettingsStats;