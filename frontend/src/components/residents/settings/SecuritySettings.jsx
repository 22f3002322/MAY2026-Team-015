import {
  Lock,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useSettingsStore from "../../../store/settingsStore";

const SecuritySettings = () => {

  const {
    security,
    updateSecurity,
    toggleSecurity,
  } = useSettingsStore();



  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    updateSecurity({
      [name]: value,
    });

  };



  const handleSave = () => {

    if(
      security.newPassword &&
      security.newPassword !==
      security.confirmPassword
    ){

      toast.error(
        "Passwords do not match."
      );

      return;

    }

    toast.success(
      "Security settings updated."
    );

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

        <Lock
          className="text-indigo-600"
        />

        <h2
          className="
          text-xl
          font-semibold
          "
        >

          Security Settings

        </h2>

      </div>





      <div className="space-y-5">

        {/* Current Password */}

        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Current Password

          </label>

          <input
            type="password"
            name="currentPassword"
            value={security.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>





        {/* New Password */}

        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            New Password

          </label>

          <input
            type="password"
            name="newPassword"
            value={security.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>





        {/* Confirm */}

        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Confirm Password

          </label>

          <input
            type="password"
            name="confirmPassword"
            value={security.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

        </div>





        {/* Two Factor */}

        <div
          className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          p-4
          "
        >

          <div
            className="
            flex
            items-center
            gap-3
            "
          >

            <ShieldCheck
              className="
              text-green-600
              "
            />

            <div>

              <h3
                className="
                font-semibold
                "
              >

                Two-Factor Authentication

              </h3>

              <p
                className="
                text-sm
                text-slate-500 dark:text-slate-400
                "
              >

                Increase account security

              </p>

            </div>

          </div>





          <button

            onClick={()=>
              toggleSecurity(
                "twoFactor"
              )
            }

            className={`
            relative
            h-7
            w-14
            rounded-full
            transition

            ${
              security.twoFactor

              ?

              "bg-green-600"

              :

              "bg-slate-300"

            }

            `}
          >

            <span

              className={`
              absolute
              top-1
              h-5
              w-5
              rounded-full
              bg-white dark:bg-slate-900
              transition

              ${
                security.twoFactor

                ?

                "left-8"

                :

                "left-1"

              }

              `}
            />

          </button>

        </div>





        {/* Auto Logout */}

        <div
          className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          p-4
          "
        >

          <div
            className="
            flex
            items-center
            gap-3
            "
          >

            <Clock
              className="
              text-indigo-600
              "
            />

            <div>

              <h3
                className="
                font-semibold
                "
              >

                Auto Logout

              </h3>

              <p
                className="
                text-sm
                text-slate-500 dark:text-slate-400
                "
              >

                Logout after inactivity

              </p>

            </div>

          </div>





          <button

            onClick={()=>
              toggleSecurity(
                "autoLogout"
              )
            }

            className={`
            relative
            h-7
            w-14
            rounded-full
            transition

            ${
              security.autoLogout

              ?

              "bg-indigo-600"

              :

              "bg-slate-300"

            }

            `}
          >

            <span

              className={`
              absolute
              top-1
              h-5
              w-5
              rounded-full
              bg-white dark:bg-slate-900
              transition

              ${
                security.autoLogout

                ?

                "left-8"

                :

                "left-1"

              }

              `}
            />

          </button>

        </div>





        {/* Session Timeout */}

        <div>

          <label
            className="
            mb-2
            block
            text-sm
            font-medium
            "
          >

            Session Timeout

          </label>

          <select
            name="sessionTimeout"
            value={security.sessionTimeout}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500"
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





        <div
          className="
          flex
          justify-end
          "
        >

          <Button
            onClick={handleSave}
          >

            Save Security Settings

          </Button>

        </div>

      </div>

    </Card>

  );

};

export default SecuritySettings;