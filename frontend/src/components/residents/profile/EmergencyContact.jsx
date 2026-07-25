import { useState } from "react";

import {
  User,
  Phone,
  HeartHandshake,
  Pencil,
  Save,
  X,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useProfileStore from "../../../store/profileStore";

const EmergencyContacts = () => {
  const profile = useProfileStore(
    (state) => state.profile
  );

  const updateEmergencyContact =
    useProfileStore(
      (state) => state.updateEmergencyContact
    );

  const [editing, setEditing] = useState(false);

  const [contact, setContact] = useState(
    profile.emergencyContact
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    updateEmergencyContact(contact);
    setEditing(false);
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 shadow-sm transition-all duration-200 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 dark:focus:border-blue-400";

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Emergency Contact
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Person to contact during emergencies
          </p>
        </div>


        {!editing ? (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit
          </Button>
        ) : (

          <div className="flex gap-3">

            <Button
              variant="outline"
              onClick={() => {
                setContact(profile.emergencyContact);
                setEditing(false);
              }}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>


            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </Button>

          </div>

        )}

      </div>


      <div className="space-y-6">


        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <User size={16} />
            Contact Name
          </label>

          <input
            type="text"
            name="name"
            disabled={!editing}
            value={contact.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>



        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <HeartHandshake size={16} />
            Relation
          </label>

          <input
            type="text"
            name="relation"
            disabled={!editing}
            value={contact.relation}
            onChange={handleChange}
            className={inputClass}
          />
        </div>



        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Phone size={16} />
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            disabled={!editing}
            value={contact.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>


      </div>

    </Card>
  );
};

export default EmergencyContacts;