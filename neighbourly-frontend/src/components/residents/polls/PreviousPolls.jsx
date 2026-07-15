import {
  History,
  Trophy,
  Users,
  CalendarDays,
} from "lucide-react";


import Card from "../../ui/Card";
import Badge from "../../ui/Badge";


const PreviousPolls = ({
  polls,
}) => {


  const closedPolls =
    polls.filter(
      (poll) =>
        poll.status === "Closed"
    );



  if(closedPolls.length === 0){

    return (

      <Card className="py-14">

        <div className="text-center">

          <History
            size={45}
            className="
            mx-auto
            text-slate-400
            "
          />

          <h3
            className="
            mt-4
            text-xl
            font-semibold
            "
          >

            No Previous Polls

          </h3>


          <p
            className="
            mt-2
            text-slate-500
            "
          >

            Completed polls will appear here.

          </p>


        </div>

      </Card>

    );

  }



  return (

    <div
      className="
      space-y-5
      "
    >


      {
        closedPolls.map(
          (poll)=>(


            <Card
              key={
                poll.id
              }
            >


              <div
                className="
                flex
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
                "
              >



                {/* Information */}


                <div>


                  <div
                    className="
                    flex
                    items-center
                    gap-3
                    "
                  >


                    <h2
                      className="
                      text-lg
                      font-bold
                      text-slate-800
                      dark:text-slate-100
                      "
                    >

                      {poll.title}

                    </h2>


                    <Badge variant="secondary">

                      Closed

                    </Badge>


                  </div>




                  <div
                    className="
                    mt-4
                    flex
                    flex-wrap
                    gap-5
                    text-sm
                    text-slate-600
                    "
                  >

                    <span
                      className="
                      flex
                      items-center
                      gap-2
                      dark:text-slate-100
                      "
                    >

                      <CalendarDays size={16}/>

                      {poll.expiryDate}

                    </span>



                    <span
                      className="
                      flex
                      items-center
                      gap-2
                      dark:text-slate-100
                      "
                    >

                      <Users size={16}/>

                      {poll.totalVotes}
                      {" "}
                      Votes

                    </span>


                  </div>


                </div>





                {/* Winner */}


                <div
                  className="
                  rounded-xl
                  bg-yellow-50
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

                    <Trophy
                      className="
                      text-yellow-600
                      "
                    />


                    <div>


                      <p
                        className="
                        text-xs
                        text-slate-500
                        "
                      >

                        Winner

                      </p>


                      <p
                        className="
                        font-bold
                        "
                      >

                        {
                          poll.options.reduce(
                            (
                              prev,
                              current
                            ) =>
                              prev.votes >
                              current.votes
                              ?
                              prev
                              :
                              current
                          ).text
                        }

                      </p>


                    </div>


                  </div>


                </div>



              </div>


            </Card>


          )
        )
      }


    </div>

  );

};


export default PreviousPolls;