import { useState } from "react";
import { toast } from "sonner";

import {
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useProfileStore from "../../../store/profileStore";

const ChangePassword = () => {
  const changePassword =
    useProfileStore(
      (state) =>
        state.changePassword
    );

  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [show, setShow] =
    useState({
      current: false,
      new: false,
      confirm: false,
    });

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const toggle = (field) => {
    setShow((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (
      formData.newPassword.length < 6
    ) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    changePassword(
      formData.currentPassword,
      formData.newPassword
    );

    toast.success(
      "Password changed successfully."
    );

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Change Password
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep your account secure by updating your password regularly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-100">
            Current Password
          </label>
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-12 outline-none focus:border-indigo-600 dark:text-slate-100"
            />
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <button
              type="button"
              onClick={() => toggle("current")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-100">
            New Password
          </label>
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-12 outline-none focus:border-indigo-600 dark:text-slate-100"
            />
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <button
              type="button"
              onClick={() => toggle("new")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-100">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-12 outline-none focus:border-indigo-600 dark:text-slate-100"
            />
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <button
              type="button"
              onClick={() => toggle("confirm")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
          >
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChangePassword;