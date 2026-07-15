import {
  HelpCircle,
  BookOpen,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

import Card from "../../ui/Card";

const HelpSupport = () => {
  const supportItems = [
    {
      icon: BookOpen,
      title: "User Guide",
      description:
        "Learn how to use the society management system.",
      action: "View Guide",
    },
    {
      icon: MessageCircle,
      title: "FAQs",
      description:
        "Find answers to frequently asked questions.",
      action: "Browse FAQs",
    },
    {
      icon: Mail,
      title: "Email Support",
      description:
        "support@greenvalley.com",
      action: "Send Email",
    },
    {
      icon: Phone,
      title: "Contact Support",
      description:
        "+91 9876543210",
      action: "Call Now",
    },
  ];

  return (
    <Card className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <HelpCircle
          className="text-indigo-600"
        />

        <h2 className="text-xl font-semibold">
          Help & Support
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {supportItems.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="
                rounded-xl
                border
                p-5
                hover:border-indigo-400
                transition
              "
            >

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-indigo-100 p-3">
                  <Icon
                    size={22}
                    className="text-indigo-600"
                  />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>

                  <button
                    className="
                      mt-4
                      text-sm
                      font-medium
                      text-indigo-600
                      hover:text-indigo-700
                    "
                  >
                    {item.action}
                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </Card>
  );
};

export default HelpSupport;