import Layout from "../../components/layout/Layout";

import ProfileSettings from "../../components/settings/ProfileSettings";
import SocietySettings from "../../components/settings/SocietySettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings";
import BackupSettings from "../../components/settings/BackupSettings";

const Settings = () => {
  return (
    <Layout
      title="Settings"
      breadcrumb={["Home", "Settings"]}
    >
      <div className="space-y-6">

        <ProfileSettings />

        <SocietySettings />

        <NotificationSettings />

        <SecuritySettings />

        <AppearanceSettings />

        <BackupSettings />

      </div>
    </Layout>
  );
};

export default Settings;