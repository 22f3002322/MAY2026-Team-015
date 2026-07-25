import Layout from "../../components/layout/Layout";
import SettingsStats from "../../components/residents/settings/SettingStats";

import AccountSettings from "../../components/residents/settings/AccountSettings";
import NotificationSettings from "../../components/residents/settings/NotificationSetttings";
import SecuritySettings from "../../components/residents/settings/SecuritySettings";
import ThemeSettings from "../../components/residents/settings/ThemeSettings";
import EmergencyContacts from "../../components/residents/settings/EmergencyContacts";
import HelpSupport from "../../components/residents/settings/HelpSupport";
import SupportTickets from "../../components/residents/settings/SupportTickets";

const Settings = () => {

  return (
    <Layout
      title="Settings"
      breadcrumb={["Resident", "Settings"]}
    >
      <div
        className="
          space-y-8
          max-w-6xl
        "
      >

      {/* Header */}

      <div>

        <h1
          className="
            text-3xl
            font-bold
            text-slate-800 dark:text-slate-100
          "
        >
          Account Settings
        </h1>

        <p
          className="
            mt-2
            text-slate-500 dark:text-slate-400
          "
        >
          Manage your account, preferences, security,
          emergency contacts and support.
        </p>

      </div>

      {/* Stats */}

      <SettingsStats />

      {/* Account */}

      <AccountSettings />

      {/* Notifications */}

      <NotificationSettings />

      {/* Security */}

      <SecuritySettings />

      {/* Appearance */}

      <ThemeSettings />

      {/* Emergency */}

      <EmergencyContacts />

      {/* Help */}

      <HelpSupport />

      {/* Tickets */}

      <SupportTickets />

      </div>
    </Layout>
  );

};

export default Settings;