import {
  CalendarDays,
  Users,
  BarChart3,
  Vote,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";


const PollCard = ({
  poll,
  onVote,
  onResults,
}) => {


  const totalVotes =
    poll.totalVotes || 0;



  return (

    <Card
      className="
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      "
    >


      {/* Header */}


      <div
        className="
        flex
        items-start
        justify-between
        gap-4
        "
      >

        <div>

          <h2
            className="
            text-xl
            font-bold
            text-slate-800 dark:text-slate-100
            "
          >

            {poll.title}

          </h2>


          <div
            className="
            mt-3
            flex
            gap-2
            "
          >

            <Badge variant="primary">

              {poll.category}

            </Badge>


            <Badge
              variant={
                poll.status === "Active"
                ? "success"
                : "secondary"
              }
            >

              {poll.status}

            </Badge>


          </div>

        </div>


        <Vote
          size={30}
          className="text-indigo-600"
        />


      </div>




      {/* Description */}


      <p
        className="
        mt-5
        line-clamp-3
        text-sm
        leading-6
        text-slate-600 dark:text-slate-300
        "
      >

        {poll.description}

      </p>





      {/* Options Preview */}


      <div
        className="
        mt-6
        space-y-4
        "
      >

        {
          poll.options.map(
            (option)=>(


              <div
                key={
                  option.id
                }
              >

                <div
                  className="
                  mb-2
                  flex
                  justify-between
                  text-sm
                  "
                >

                  <span
                    className="font-medium"
                  >

                    {option.text}

                  </span>


                  <span
                    className="text-slate-500 dark:text-slate-400"
                  >

                    {option.votes}

                  </span>


                </div>



                <div
                  className="
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-slate-200
                  "
                >

                  <div

                    className="
                    h-full
                    rounded-full
                    bg-indigo-600
                    "

                    style={{
                      width:
                      totalVotes
                      ?
                      `${(
                        option.votes /
                        totalVotes
                      ) * 100}%`
                      :
                      "0%",
                    }}

                  />

                </div>


              </div>


            )
          )
        }


      </div>





      {/* Meta */}


      <div
        className="
        mt-6
        space-y-3
        text-sm
        text-slate-600 dark:text-slate-300
        "
      >


        <div
          className="
          flex
          items-center
          gap-2
          "
        >

          <Users size={16}/>

          <span>

            {poll.totalVotes}
            {" "}
            votes

          </span>


        </div>



        <div
          className="
          flex
          items-center
          gap-2
          "
        >

          <CalendarDays size={16}/>


          <span>

            Ends:
            {" "}
            {poll.expiryDate}

          </span>


        </div>


      </div>





      {/* Actions */}


      <div
        className="
        mt-6
        flex
        gap-3
        "
      >


        <Button

          className="flex-1"

          disabled={
            poll.userVoted ||
            poll.status !== "Active"
          }

          onClick={() =>
            onVote(poll)
          }

        >

          <Vote size={18}/>

          {
            poll.userVoted
            ?
            "Voted"
            :
            "Vote"
          }


        </Button>




        <Button

          variant="outline"

          className="flex-1"

          onClick={() =>
            onResults(poll)
          }

        >

          <BarChart3 size={18}/>

          Results

        </Button>


      </div>


    </Card>

  );

};


export default PollCard;