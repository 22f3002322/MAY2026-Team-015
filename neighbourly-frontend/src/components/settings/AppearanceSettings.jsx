import Card from "../ui/Card";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const AppearanceSettings = () => {
  const appearance =
    useSettingsStore(
      (state) => state.appearance
    );

  const updateAppearance =
    useSettingsStore(
      (state) =>
        state.updateAppearance
    );

  const handleChange = (
    field,
    value
  ) => {
    updateAppearance({
      [field]: value,
    });
  };

  const handleSave = () => {
    alert(
      "Appearance settings updated successfully!"
    );

    console.log(appearance);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Appearance Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Theme
          </label>

          <select
            value={appearance.theme}
            onChange={(e) =>
              handleChange(
                "theme",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Light</option>
            <option>Dark</option>
            <option>System Default</option>
          </select>
        </div>

        {/* Primary Color */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Primary Color
          </label>

          <select
            value={
              appearance.primaryColor
            }
            onChange={(e) =>
              handleChange(
                "primaryColor",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Indigo</option>
            <option>Blue</option>
            <option>Green</option>
            <option>Purple</option>
            <option>Red</option>
          </select>
        </div>

        {/* Sidebar */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Sidebar Style
          </label>

          <select
            value={appearance.sidebar}
            onChange={(e) =>
              handleChange(
                "sidebar",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Expanded</option>
            <option>Compact</option>
          </select>
        </div>

        {/* Dashboard Density */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Dashboard Density
          </label>

          <select
            value={
              appearance.density
            }
            onChange={(e) =>
              handleChange(
                "density",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>
              Comfortable
            </option>
            <option>Compact</option>
          </select>
        </div>
      </div>

      {/* Preview */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="mb-4 font-semibold text-slate-700">
          Preview
        </h3>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white">
            Theme:{" "}
            {appearance.theme}
          </span>

          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">
            Color:{" "}
            {
              appearance.primaryColor
            }
          </span>

          <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">
            Sidebar:{" "}
            {
              appearance.sidebar
            }
          </span>

          <span className="rounded-full bg-orange-500 px-4 py-2 text-sm text-white">
            Density:{" "}
            {
              appearance.density
            }
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
        >
          Save Appearance
        </Button>
      </div>
    </Card>
  );
};

export default AppearanceSettings;