import Card from "../ui/Card";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const BackupSettings = () => {
  const exportData = useSettingsStore(
    (state) => state.exportData
  );

  const importData = useSettingsStore(
    (state) => state.importData
  );

  const createBackup = useSettingsStore(
    (state) => state.createBackup
  );

  const restoreBackup = useSettingsStore(
    (state) => state.restoreBackup
  );

  const downloadReports = useSettingsStore(
    (state) => state.downloadReports
  );

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Backup & Data Management
      </h2>

      <p className="mb-8 text-slate-500">
        Export, import and backup all society records.
        These actions help safeguard important data and
        simplify migration between systems.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Export */}

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold">
            Export Data
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Download all residents, apartments,
            complaints, visitors and billing records.
          </p>

          <Button
            className="mt-5 w-full"
            onClick={exportData}
          >
            Export Data
          </Button>
        </div>

        {/* Import */}

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold">
            Import Data
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Import existing records from another
            management system.
          </p>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={importData}
          >
            Import Data
          </Button>
        </div>

        {/* Backup */}

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold">
            Create Backup
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Generate a complete backup of your society
            database.
          </p>

          <Button
            className="mt-5 w-full"
            onClick={createBackup}
          >
            Create Backup
          </Button>
        </div>

        {/* Restore */}

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold">
            Restore Backup
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Restore previously downloaded backup files.
          </p>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={restoreBackup}
          >
            Restore Backup
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-indigo-700">
              Reports
            </h3>

            <p className="mt-1 text-sm text-indigo-600">
              Download all society reports in one click.
            </p>
          </div>

          <Button onClick={downloadReports}>
            Download Reports
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BackupSettings;