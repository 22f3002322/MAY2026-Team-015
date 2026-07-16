import { useState } from "react";
import { User } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useProfileStore from "../../../store/profileStore";

const AccountSettings = () => {

  const {
    profile,
    updateProfile,
  } = useProfileStore();


  const [formData, setFormData] =
    useState({

      name:
        profile.name,

      email:
        profile.email,

      phone:
        profile.phone,

    });



  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };



  const handleSubmit = (e) => {

    e.preventDefault();

    updateProfile(formData);

  };



  return (

    <Card className="p-6">

      <div
        className="
        mb-6
        flex
        items-center
        gap-3
        "
      >

        <User
          className="text-indigo-600"
        />

        <h2
          className="
          text-xl
          font-semibold
          "
        >

          Account Settings

        </h2>

      </div>



      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Full Name

          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>



        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Email

          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>



        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Phone Number

          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>



        <div
          className="
          grid
          gap-4
          md:grid-cols-2
          "
        >

          <div>

            <label
              className="
              mb-2
              block
              text-sm
              font-medium
              "
            >

              Flat

            </label>

            <input
              value={profile.flat || ""}
              disabled
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 p-3 cursor-not-allowed"
            />

          </div>



          <div>

            <label
              className="
              mb-2
              block
              text-sm
              font-medium
              "
            >

              Occupancy

            </label>

            <input
              value={profile.occupancy || ""}
              disabled
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 p-3 cursor-not-allowed"
            />

          </div>

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

export default AccountSettings;