import { useState } from "react";

import {
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useSettingsStore from "../../../store/settingsStore";

const EmergencyContacts = () => {

  const {
    emergencyContacts,
    addEmergencyContact,
    deleteEmergencyContact,
  } = useSettingsStore();

  const [contact, setContact] =
    useState({
      name: "",
      phone: "",
      role: "",
    });

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setContact((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !contact.name ||
      !contact.phone ||
      !contact.role
    )
      return;

    addEmergencyContact(contact);

    setContact({
      name: "",
      phone: "",
      role: "",
    });

  };

  return (

    <Card className="p-6">

      <div className="flex items-center gap-3 mb-6">

        <Phone className="text-indigo-600" />

        <h2 className="text-xl font-semibold">
          Emergency Contacts
        </h2>

      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-4 mb-8"
      >

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={contact.name}
          onChange={handleChange}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={contact.phone}
          onChange={handleChange}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <input
          type="text"
          name="role"
          placeholder="Role"
          value={contact.role}
          onChange={handleChange}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <Button
          type="submit"
          className="flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add
        </Button>

      </form>

      <div className="space-y-4">

        {emergencyContacts.map(
          (contact) => (

            <div
              key={contact.id}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-4
              "
            >

              <div>

                <h3 className="font-semibold">
                  {contact.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {contact.role}
                </p>

                <p className="text-sm font-medium">
                  {contact.phone}
                </p>

              </div>

              <Button
                variant="danger"
                onClick={() =>
                  deleteEmergencyContact(
                    contact.id
                  )
                }
              >
                <Trash2 size={18} />
              </Button>

            </div>

          )
        )}

      </div>

    </Card>

  );

};

export default EmergencyContacts;