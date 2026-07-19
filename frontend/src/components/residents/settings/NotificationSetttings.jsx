import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Wrench,
  Users,
  CreditCard,
} from "lucide-react";

import Card from "../../ui/Card";

import useSettingsStore from "../../../store/settingsStore";

const NotificationSettings = () => {

  const {
    notifications,
    toggleNotification,
  } = useSettingsStore();



  const items = [

    {
      key:
        "emailNotifications",

      title:
        "Email Notifications",

      description:
        "Receive important updates via email.",

      icon:
        Mail,
    },

    {
      key:
        "smsNotifications",

      title:
        "SMS Notifications",

      description:
        "Receive SMS alerts.",

      icon:
        MessageSquare,
    },

    {
      key:
        "pushNotifications",

      title:
        "Push Notifications",

      description:
        "Receive browser/mobile notifications.",

      icon:
        Bell,
    },

    {
      key:
        "complaintAlerts",

      title:
        "Complaint Alerts",

      description:
        "Updates about complaints.",

      icon:
        Wrench,
    },

    {
      key:
        "visitorAlerts",

      title:
        "Visitor Alerts",

      description:
        "Notifications for visitor entries.",

      icon:
        Users,
    },

    {
      key:
        "billingAlerts",

      title:
        "Billing Alerts",

      description:
        "Payment and due reminders.",

      icon:
        CreditCard,
    },

  ];



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

        <Smartphone
          className="text-indigo-600"
        />

        <h2
          className="
          text-xl
          font-semibold
          "
        >

          Notification Settings

        </h2>

      </div>



      <div
        className="
        divide-y
        "
      >

        {

          items.map((item)=>{

            const Icon =
              item.icon;

            return (

              <div

                key={
                  item.key
                }

                className="
                flex
                items-center
                justify-between
                py-5
                "

              >

                <div
                  className="
                  flex
                  items-start
                  gap-4
                  "
                >

                  <div
                    className="
                    rounded-xl
                    bg-indigo-100
                    p-3
                    "
                  >

                    <Icon
                      className="
                      text-indigo-600
                      "
                      size={20}
                    />

                  </div>



                  <div>

                    <h3
                      className="
                      font-semibold
                      "
                    >

                      {item.title}

                    </h3>

                    <p
                      className="
                      mt-1
                      text-sm
                      text-slate-500
                      "
                    >

                      {item.description}

                    </p>

                  </div>

                </div>





                <button

                  onClick={()=>
                    toggleNotification(
                      item.key
                    )
                  }

                  className={`
                  relative
                  h-7
                  w-14
                  rounded-full
                  transition

                  ${
                    notifications[
                      item.key
                    ]

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
                    bg-white
                    transition

                    ${
                      notifications[
                        item.key
                      ]

                      ?

                      "left-8"

                      :

                      "left-1"

                    }

                    `}

                  />

                </button>

              </div>

            );

          })

        }

      </div>

    </Card>

  );

};

export default NotificationSettings;