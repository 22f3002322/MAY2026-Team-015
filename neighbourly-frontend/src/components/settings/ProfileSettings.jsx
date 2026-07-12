import { useState } from "react";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const ProfileSettings = () => {
  const profile = useSettingsStore(
    (state) => state.profile
  );

  const updateProfile = useSettingsStore(
    (state) => state.updateProfile
  );

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    updateProfile({
      [field]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!profile.name.trim())
      newErrors.name = "Name is required.";

    if (!profile.email.trim())
      newErrors.email = "Email is required.";

    if (!profile.phone.trim())
      newErrors.phone =
        "Phone number is required.";

    if (!profile.designation.trim())
      newErrors.designation =
        "Designation is required.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    alert("Profile updated successfully!");

    console.log(profile);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Profile Settings
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Avatar */}

        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
            {profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              className="block text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG up to 5MB
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Full Name"
            value={profile.name}
            error={errors.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
          />

          <Input
            label="Email"
            type="email"
            value={profile.email}
            error={errors.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
          />

          <Input
            label="Phone Number"
            value={profile.phone}
            error={errors.phone}
            onChange={(e) =>
              handleChange(
                "phone",
                e.target.value
              )
            }
          />

          <Input
            label="Designation"
            value={profile.designation}
            error={errors.designation}
            onChange={(e) =>
              handleChange(
                "designation",
                e.target.value
              )
            }
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;