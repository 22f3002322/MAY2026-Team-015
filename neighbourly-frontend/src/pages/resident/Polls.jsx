import {
  useMemo,
  useState,
} from "react";


import Layout from "../../components/layout/Layout";


import PollStats from "../../components/residents/polls/PollStats";
import PollFilters from "../../components/residents/polls/PollFilters";
import PollCard from "../../components/residents/polls/PollCard";
import VoteModal from "../../components/residents/polls/VoteModal";
import PollResults from "../../components/residents/polls/PollResults";
import PreviousPolls from "../../components/residents/polls/PreviousPolls";


import usePollStore from "../../store/pollStore";



const Polls = () => {


  const polls =
    usePollStore(
      (state) =>
        state.polls
    );



  const [
    search,
    setSearch,
  ] = useState("");



  const [
    category,
    setCategory,
  ] = useState("");



  const [
    status,
    setStatus,
  ] = useState("Active");



  const [
    sort,
    setSort,
  ] = useState("newest");



  const [
    selectedPoll,
    setSelectedPoll,
  ] = useState(null);



  const [
    resultPoll,
    setResultPoll,
  ] = useState(null);






  const filteredPolls =
    useMemo(()=>{


      let data =
        [...polls];



      // Search

      if(search.trim()){

        const query =
          search.toLowerCase();


        data =
          data.filter(
            (poll)=>
              poll.title
              .toLowerCase()
              .includes(query)
          );

      }




      // Category

      if(category){

        data =
          data.filter(
            (poll)=>
              poll.category === category
          );

      }





      // Status

      if(status){

        data =
          data.filter(
            (poll)=>
              poll.status === status
          );

      }






      // Sorting

      data.sort(
        (a,b)=>{


          if(
            sort === "votes"
          ){

            return (
              b.totalVotes -
              a.totalVotes
            );

          }




          if(
            sort === "expiry"
          ){

            return (
              new Date(
                a.expiryDate
              )
              -
              new Date(
                b.expiryDate
              )
            );

          }





          return (

            new Date(
              b.createdAt
            )
            -
            new Date(
              a.createdAt
            )

          );


        }
      );



      return data;



    },[
      polls,
      search,
      category,
      status,
      sort,
    ]);







  return (

    <Layout

      title="Community Polls"

      breadcrumb={[
        "Resident",
        "Polls",
      ]}

    >



      {/* Statistics */}

      <PollStats />





      {/* Filters */}


      <PollFilters

        search={search}

        setSearch={setSearch}

        category={category}

        setCategory={setCategory}

        status={status}

        setStatus={setStatus}

        sort={sort}

        setSort={setSort}

      />






      {/* Active Polls */}


      <section
        className="mb-12"
      >


        <div
          className="
          mb-6
          flex
          justify-between
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-slate-800
            "
          >

            Active Polls

          </h2>


          <span
            className="
            text-sm
            text-slate-500
            "
          >

            {
              filteredPolls.length
            }
            {" "}
            Polls

          </span>


        </div>





        {
          filteredPolls.length === 0 ?


          (

            <div
              className="
              rounded-xl
              border-2
              border-dashed
              p-16
              text-center
              "
            >

              No active polls found

            </div>

          )


          :

          (

            <div
              className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
              "
            >

              {
                filteredPolls.map(
                  (poll)=>(


                    <PollCard

                      key={
                        poll.id
                      }


                      poll={
                        poll
                      }


                      onVote={
                        setSelectedPoll
                      }


                      onResults={
                        setResultPoll
                      }


                    />


                  )
                )
              }


            </div>

          )

        }


      </section>







      {/* Previous Polls */}


      <section>


        <h2
          className="
          mb-6
          text-2xl
          font-bold
          text-slate-800
          "
        >

          Previous Polls

        </h2>



        <PreviousPolls

          polls={
            polls
          }

        />


      </section>







      {/* Vote Modal */}


      <VoteModal

        poll={
          selectedPoll
        }


        onClose={() =>
          setSelectedPoll(null)
        }

      />







      {/* Results Modal */}


      <PollResults

        poll={
          resultPoll
        }


        onClose={() =>
          setResultPoll(null)
        }

      />



    </Layout>

  );

};


export default Polls;