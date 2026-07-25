import { toast } from "sonner";

import Card from "../ui/Card";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const NotificationSettings = () => {
  const notifications = useSettingsStore(
    (state) => state.notifications
  );

  const updateNotifications =
    useSettingsStore(
      (state) =>
        state.updateNotifications
    );

  const toggleSetting = (key) => {
    updateNotifications({
      [key]: !notifications[key],
    });
  };

  const options = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description:
        "Receive important updates via email.",
    },
    {
      key: "smsNotifications",
      title: "SMS Notifications",
      description:
        "Receive alerts through SMS.",
    },
    {
      key: "pushNotifications",
      title: "Push Notifications",
      description:
        "Receive browser push notifications.",
    },
    {
      key: "complaintAlerts",
      title: "Complaint Alerts",
      description:
        "Get notified when new complaints are submitted.",
    },
    {
      key: "visitorAlerts",
      title: "Visitor Alerts",
      description:
        "Receive notifications when visitors arrive.",
    },
    {
      key: "billingAlerts",
      title: "Billing Alerts",
      description:
        "Receive reminders for billing and payments.",
    },
  ];

  const handleSave = () => {
    toast.success(
      "Notification settings updated successfully!"
    );

    console.log(notifications);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800 dark:text-slate-100">
        Notification Settings
      </h2>

      <div className="space-y-5">
        {options.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                toggleSetting(item.key)
              }
              className={`relative h-7 w-14 rounded-full transition ${
                notifications[item.key]
                  ? "bg-indigo-600"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 transition ${
                  notifications[item.key]
                    ? "left-8"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default NotificationSettings;