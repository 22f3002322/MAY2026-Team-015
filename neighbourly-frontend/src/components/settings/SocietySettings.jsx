import { useState } from "react";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

import useSettingsStore from "../../store/settingsStore";

const SocietySettings = () => {
  const society = useSettingsStore(
    (state) => state.society
  );

  const updateSociety = useSettingsStore(
    (state) => state.updateSociety
  );

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    updateSociety({
      [field]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!society.societyName.trim())
      newErrors.societyName =
        "Society name is required.";

    if (!society.registrationNo.trim())
      newErrors.registrationNo =
        "Registration number is required.";

    if (!society.address.trim())
      newErrors.address =
        "Address is required.";

    if (!society.contactEmail.trim())
      newErrors.contactEmail =
        "Email is required.";

    if (!society.contactPhone.trim())
      newErrors.contactPhone =
        "Phone number is required.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    alert("Society settings updated successfully!");

    console.log(society);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Society Settings
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Society Name"
            value={society.societyName}
            error={errors.societyName}
            onChange={(e) =>
              handleChange(
                "societyName",
                e.target.value
              )
            }
          />

          <Input
            label="Registration Number"
            value={society.registrationNo}
            error={errors.registrationNo}
            onChange={(e) =>
              handleChange(
                "registrationNo",
                e.target.value
              )
            }
          />

          <Input
            label="Contact Email"
            type="email"
            value={society.contactEmail}
            error={errors.contactEmail}
            onChange={(e) =>
              handleChange(
                "contactEmail",
                e.target.value
              )
            }
          />

          <Input
            label="Contact Phone"
            value={society.contactPhone}
            error={errors.contactPhone}
            onChange={(e) =>
              handleChange(
                "contactPhone",
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Society Address
          </label>

          <textarea
            rows={4}
            value={society.address}
            onChange={(e) =>
              handleChange(
                "address",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-indigo-600"
            placeholder="Enter society address..."
          />

          {errors.address && (
            <p className="mt-2 text-sm text-red-600">
              {errors.address}
            </p>
          )}
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

export default SocietySettings;