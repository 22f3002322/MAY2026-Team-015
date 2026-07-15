import { useState } from "react";

import Button from "../../ui/Button";

const ProfileForm = ({
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] =
    useState({
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      block: initialData?.block || "",
      flat: initialData?.flat || "",
      occupancy:
        initialData?.occupancy || "Owner",
      avatar:
        initialData?.avatar || "",
      familyMembers:
        initialData?.familyMembers || 1,
      vehicles:
        initialData?.vehicles || 0,
    });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "familyMembers" ||
        name === "vehicles"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const disabledClass =
    "bg-slate-100 cursor-not-allowed text-slate-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Full Name
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          disabled
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none ${disabledClass}`}
        />
      </div>


      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        />
      </div>


      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Phone
        </label>

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          disabled
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none ${disabledClass}`}
        />
      </div>


      {/* Block & Flat */}
      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Block
          </label>

          <input
            type="text"
            name="block"
            value={formData.block}
            disabled
            className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none ${disabledClass}`}
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Flat
          </label>

          <input
            type="text"
            name="flat"
            value={formData.flat}
            disabled
            className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none ${disabledClass}`}
          />
        </div>

      </div>


      {/* Occupancy */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Occupancy
        </label>

        <select
          name="occupancy"
          value={formData.occupancy}
          disabled
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 outline-none ${disabledClass}`}
        >
          <option value="Owner">
            Owner
          </option>

          <option value="Tenant">
            Tenant
          </option>
        </select>
      </div>


      {/* Avatar */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Profile Image URL
        </label>

        <input
          type="text"
          name="avatar"
          value={formData.avatar}
          onChange={handleChange}
          placeholder="https://..."
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
        />
      </div>


      {/* Family & Vehicles */}
      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Family Members
          </label>

          <input
            type="number"
            min="1"
            name="familyMembers"
            value={formData.familyMembers}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Vehicles
          </label>

          <input
            type="number"
            min="0"
            name="vehicles"
            value={formData.vehicles}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />
        </div>

      </div>


      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Save Changes
        </Button>

      </div>

    </form>
  );
};

export default ProfileForm;