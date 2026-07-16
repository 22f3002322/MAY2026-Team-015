import {
  Trophy,
  Users,
  BarChart3,
} from "lucide-react";


import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";


const PollResults = ({
  poll,
  onClose,
}) => {


  if(!poll)
    return null;



  const totalVotes =
    poll.totalVotes || 0;



  const winner =
    poll.options.reduce(
      (prev,current)=>
        prev.votes >
        current.votes
        ? prev
        : current
    );



  return (

    <Modal

      open={!!poll}

      title="Poll Results"

      onClose={onClose}

    >


      <div
        className="
        space-y-6
        "
      >


        {/* Header */}


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


          <p
            className="
            mt-2
            text-slate-500 dark:text-slate-400
            "
          >

            {poll.description}

          </p>


        </div>





        {/* Summary Cards */}


        <div
          className="
          grid
          gap-4
          sm:grid-cols-2
          "
        >


          <div
            className="
            rounded-xl
            bg-indigo-50 dark:bg-indigo-950
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

              <Users
                className="text-indigo-600"
              />

              <div>

                <p
                  className="
                  text-sm
                  text-slate-500 dark:text-slate-400
                  "
                >

                  Total Votes

                </p>


                <h3
                  className="
                  text-2xl
                  font-bold
                  "
                >

                  {totalVotes}

                </h3>


              </div>


            </div>


          </div>




          <div
            className="
            rounded-xl
            bg-green-50 dark:bg-green-900/30
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
                className="text-green-600"
              />

              <div>


                <p
                  className="
                  text-sm
                  text-slate-500 dark:text-slate-400
                  "
                >

                  Leading Option

                </p>


                <h3
                  className="
                  font-bold
                  "
                >

                  {winner.text}

                </h3>


              </div>


            </div>


          </div>


        </div>





        {/* Results */}


        <div
          className="
          space-y-5
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
                    "
                  >


                    <span
                      className="
                      font-medium
                      "
                    >

                      {option.text}

                    </span>


                    <span
                      className="
                      text-sm
                      text-slate-500 dark:text-slate-400
                      "
                    >

                      {option.votes}
                      {" "}
                      votes

                    </span>


                  </div>




                  <div
                    className="
                    h-3
                    overflow-hidden
                    rounded-full
                    bg-slate-200 dark:bg-slate-700
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
                        "0%"
                      }}

                    />

                  </div>



                  <p
                    className="
                    mt-1
                    text-right
                    text-xs
                    text-slate-500 dark:text-slate-400
                    "
                  >

                    {
                      totalVotes
                      ?
                      (
                        (
                          option.votes /
                          totalVotes
                        ) *
                        100
                      )
                      .toFixed(1)
                      :
                      0
                    }
                    %

                  </p>


                </div>


              )
            )

          }


        </div>




        <div
          className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-yellow-50 dark:bg-yellow-900/30
          dark:text-slate-300
          p-4
          text-sm
          "
        >

          <BarChart3 size={18}/>

          Results update automatically
          after every vote.

        </div>


      </div>


    </Modal>

  );

};


export default PollResults;