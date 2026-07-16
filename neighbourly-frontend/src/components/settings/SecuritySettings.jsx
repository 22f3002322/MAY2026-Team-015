import { useState } from "react";
import { toast } from "sonner";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const SecuritySettings = () => {
  const security = useSettingsStore(
    (state) => state.security
  );

  const updateSecurity = useSettingsStore(
    (state) => state.updateSecurity
  );

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    updateSecurity({
      [field]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const toggle = (field) => {
    updateSecurity({
      [field]: !security[field],
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!security.currentPassword)
      newErrors.currentPassword =
        "Current password is required.";

    if (!security.newPassword)
      newErrors.newPassword =
        "New password is required.";

    if (
      security.newPassword &&
      security.newPassword.length < 8
    )
      newErrors.newPassword =
        "Password must be at least 8 characters.";

    if (
      security.confirmPassword !==
      security.newPassword
    )
      newErrors.confirmPassword =
        "Passwords do not match.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    toast.success(
      "Security settings updated successfully!"
    );

    console.log(security);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800 dark:text-slate-100">
        Security Settings
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Input
            label="Current Password"
            type="password"
            value={security.currentPassword}
            error={errors.currentPassword}
            onChange={(e) =>
              handleChange(
                "currentPassword",
                e.target.value
              )
            }
          />

          <Input
            label="New Password"
            type="password"
            value={security.newPassword}
            error={errors.newPassword}
            onChange={(e) =>
              handleChange(
                "newPassword",
                e.target.value
              )
            }
          />

          <Input
            label="Confirm Password"
            type="password"
            value={security.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) =>
              handleChange(
                "confirmPassword",
                e.target.value
              )
            }
          />
        </div>

        {/* Two Factor */}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Two-Factor Authentication
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add an extra layer of security to your
              account.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              toggle("twoFactor")
            }
            className={`relative h-7 w-14 rounded-full transition ${
              security.twoFactor
                ? "bg-indigo-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 transition ${
                security.twoFactor
                  ? "left-8"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Auto Logout */}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Auto Logout
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Automatically log out after inactivity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              toggle("autoLogout")
            }
            className={`relative h-7 w-14 rounded-full transition ${
              security.autoLogout
                ? "bg-indigo-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 transition ${
                security.autoLogout
                  ? "left-8"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Session Timeout */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Session Timeout
          </label>

          <select
            value={security.sessionTimeout}
            onChange={(e) =>
              handleChange(
                "sessionTimeout",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option value="15">
              15 Minutes
            </option>

            <option value="30">
              30 Minutes
            </option>

            <option value="60">
              1 Hour
            </option>

            <option value="120">
              2 Hours
            </option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Save Security Settings
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SecuritySettings;