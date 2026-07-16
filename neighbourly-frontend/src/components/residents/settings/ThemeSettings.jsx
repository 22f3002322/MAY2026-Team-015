import {
  Palette,
  Moon,
  Sun,
  LayoutDashboard,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useSettingsStore from "../../../store/settingsStore";
import useThemeStore from "../../../store/themeStore";

const ThemeSettings = () => {
  const {
    appearance,
    updateAppearance,
  } = useSettingsStore();

  const currentTheme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateAppearance({
      [name]: value,
    });
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    updateAppearance({
      theme: nextTheme === "light" ? "Light" : "Dark",
    });
  };

  const getThemeText = () => {
    if (currentTheme === "light") return "Light";
    if (currentTheme === "dark") return "Dark";
    return "System Default";
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/50 dark:border-slate-800 pb-4">
        <Palette className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Appearance Settings
        </h2>
      </div>

      <div className="space-y-6">
        {/* Theme Toggle Card */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            {currentTheme === "light" ? (
              <Sun className="text-yellow-500" />
            ) : (
              <Moon className="text-indigo-500 dark:text-indigo-400" />
            )}
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-250">
                Theme
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current: {getThemeText()}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={toggleTheme}
          >
            Switch Theme
          </Button>
        </div>

        {/* Primary Color Select */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Primary Color
          </label>
          <select
            name="primaryColor"
            value={appearance.primaryColor}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Indigo</option>
            <option>Blue</option>
            <option>Green</option>
            <option>Purple</option>
            <option>Rose</option>
          </select>
        </div>

        {/* Sidebar Style Select */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sidebar Mode
          </label>
          <select
            name="sidebar"
            value={appearance.sidebar}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Expanded</option>
            <option>Collapsed</option>
          </select>
        </div>

        {/* Density Select */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            UI Density
          </label>
          <select
            name="density"
            value={appearance.density}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Comfortable</option>
            <option>Compact</option>
          </select>
        </div>

        {/* Preview Block */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                Preview
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Theme: {getThemeText()} • Color: {appearance.primaryColor} • Sidebar: {appearance.sidebar}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ThemeSettings;