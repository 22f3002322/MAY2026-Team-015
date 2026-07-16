import {
  Vote,
  Activity,
  Users,
  CheckCircle,
} from "lucide-react";

import Card from "../../ui/Card";

import usePollStore from "../../../store/pollStore";


const PollStats = () => {

  const polls = usePollStore(
    (state) => state.polls
  );


  const totalPolls =
    polls.length;


  const activePolls =
    polls.filter(
      (poll) =>
        poll.status === "Active"
    ).length;


  const totalVotes =
    polls.reduce(
      (sum, poll) =>
        sum + poll.totalVotes,
      0
    );


  const participated =
    polls.filter(
      (poll) =>
        poll.userVoted
    ).length;



  const stats = [

    {
      title:
        "Total Polls",

      value:
        totalPolls,

      icon:
        Vote,

      color:
        "bg-indigo-100 text-indigo-600",
    },


    {
      title:
        "Active Polls",

      value:
        activePolls,

      icon:
        Activity,

      color:
        "bg-green-100 text-green-600",
    },


    {
      title:
        "Total Votes",

      value:
        totalVotes,

      icon:
        Users,

      color:
        "bg-blue-100 text-blue-600",
    },


    {
      title:
        "My Participation",

      value:
        participated,

      icon:
        CheckCircle,

      color:
        "bg-amber-100 text-amber-600",
    },

  ];



  return (

    <div
      className="
      mb-6
      grid
      gap-6
      sm:grid-cols-2
      xl:grid-cols-4
      "
    >

      {
        stats.map(
          (item)=>

          <Card
            key={
              item.title
            }
          >

            <div
              className="
              flex
              items-center
              justify-between
              "
            >

              <div>

                <p
                  className="
                  text-sm
                  text-slate-500 dark:text-slate-400
                  "
                >

                  {
                    item.title
                  }

                </p>


                <h2
                  className="
                  mt-3
                  text-3xl
                  font-bold
                  text-slate-800 dark:text-slate-100
                  "
                >

                  {
                    item.value
                  }

                </h2>

              </div>



              <div
                className={`
                rounded-xl
                p-3
                ${item.color}
                `}
              >

                <item.icon
                  size={25}
                />

              </div>


            </div>

          </Card>

        )
      }

    </div>

  );

};


export default PollStats;