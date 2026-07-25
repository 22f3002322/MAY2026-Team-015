import { useState } from "react";

import {
  LifeBuoy,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useSettingsStore from "../../../store/settingsStore";

const SupportTickets = () => {

  const {
    supportTickets,
    addSupportTicket,
    closeSupportTicket,
    deleteSupportTicket,
    getSupportStats,
  } = useSettingsStore();

  const stats = getSupportStats();

  const [ticket, setTicket] =
    useState({
      subject: "",
      category: "General",
      priority: "Medium",
    });

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setTicket((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!ticket.subject.trim())
      return;

    addSupportTicket(ticket);

    setTicket({
      subject: "",
      category: "General",
      priority: "Medium",
    });

  };

  return (

    <div className="space-y-6">

      {/* Stats */}

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="p-5">

          <p className="text-sm text-slate-500">
            Total Tickets
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {stats.total}
          </h2>

        </Card>

        <Card className="p-5">

          <p className="text-sm text-slate-500">
            Open
          </p>

          <h2 className="text-3xl font-bold mt-2 text-orange-500">
            {stats.open}
          </h2>

        </Card>

        <Card className="p-5">

          <p className="text-sm text-slate-500">
            Closed
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {stats.closed}
          </h2>

        </Card>

      </div>

      {/* Create Ticket */}

      <Card className="p-6">

        <div className="flex items-center gap-3 mb-6">

          <LifeBuoy className="text-indigo-600"/>

          <h2 className="text-xl font-semibold">
            Create Support Ticket
          </h2>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-4"
        >

          <input
            type="text"
            name="subject"
            placeholder="Issue"
            value={ticket.subject}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

          <select
            name="category"
            value={ticket.category}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500"
          >

            <option>General</option>
            <option>Maintenance</option>
            <option>Security</option>
            <option>Billing</option>

          </select>

          <select
            name="priority"
            value={ticket.priority}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 outline-none focus:border-indigo-500"
          >

            <option>Low</option>
            <option>Medium</option>
            <option>High</option>

          </select>

          <Button
            type="submit"
            className="flex items-center justify-center gap-2"
          >

            <Plus size={18}/>

            Create

          </Button>

        </form>

      </Card>

      {/* Ticket List */}

      <Card className="p-6">

        <h2 className="text-xl font-semibold mb-6">
          My Tickets
        </h2>

        <div className="space-y-4">

          {supportTickets.map((ticket)=>(

            <div
              key={ticket.id}
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-4
                rounded-xl
                border
                p-4
              "
            >

              <div>

                <h3 className="font-semibold">
                  {ticket.subject}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {ticket.category}
                </p>

                <div className="flex gap-2 mt-2">

                  <span
                    className="
                      rounded-full
                      bg-indigo-100
                      px-3
                      py-1
                      text-xs
                    "
                  >
                    {ticket.priority}
                  </span>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs

                      ${
                        ticket.status==="Open"

                        ?

                        "bg-orange-100 text-orange-700"

                        :

                        "bg-green-100 text-green-700"

                      }
                    `}
                  >

                    {ticket.status}

                  </span>

                </div>

              </div>

              <div className="flex gap-2">

                {

                  ticket.status==="Open" && (

                    <Button
                      onClick={()=>
                        closeSupportTicket(ticket.id)
                      }
                    >

                      <CheckCircle size={18}/>

                    </Button>

                  )

                }

                <Button
                  variant="danger"
                  onClick={()=>
                    deleteSupportTicket(ticket.id)
                  }
                >

                  <Trash2 size={18}/>

                </Button>

              </div>

            </div>

          ))}

        </div>

      </Card>

    </div>

  );

};

export default SupportTickets;