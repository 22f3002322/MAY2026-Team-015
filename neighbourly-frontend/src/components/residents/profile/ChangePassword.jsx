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

  const PasswordInput = ({
    label,
    name,
    visible,
    toggleKey,
  }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            visible
              ? "text"
              : "password"
          }
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-12 outline-none focus:border-indigo-600"
        />

        <Lock
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <button
          type="button"
          onClick={() =>
            toggle(toggleKey)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Change Password
        </h3>

        <p className="text-sm text-slate-500">
          Keep your account secure by
          updating your password
          regularly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          visible={show.current}
          toggleKey="current"
        />

        <PasswordInput
          label="New Password"
          name="newPassword"
          visible={show.new}
          toggleKey="new"
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          visible={show.confirm}
          toggleKey="confirm"
        />

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