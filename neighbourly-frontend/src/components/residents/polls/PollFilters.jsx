import {
  Search,
  RotateCcw,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";


const PollFilters = ({
  search,
  setSearch,

  category,
  setCategory,

  status,
  setStatus,

  sort,
  setSort,
}) => {


  const resetFilters = () => {

    setSearch("");

    setCategory("");

    setStatus("");

    setSort("newest");

  };



  return (

    <Card className="mb-6 p-6">

      <div
        className="
        grid
        gap-5
        md:grid-cols-2
        xl:grid-cols-5
        "
      >


        {/* Search */}


        <div
          className="
          relative
          xl:col-span-2
          "
        >

          <Search

            size={18}

            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-400
            "

          />


          <input

            type="text"

            placeholder="Search polls..."

            value={search}

            onChange={(e)=>
              setSearch(
                e.target.value
              )
            }

            className="
            h-12
            w-full
            rounded-xl
            border border-slate-200 dark:border-slate-700
            border-slate-300 dark:border-slate-700
            pl-11
            pr-4
            outline-none
            focus:border-indigo-600
            "

          />


        </div>




        {/* Category */}


        <select

          value={category}

          onChange={(e)=>
            setCategory(
              e.target.value
            )
          }

          className="
          h-12
          rounded-xl
          border border-slate-200 dark:border-slate-700
          border-slate-300 dark:border-slate-700
          px-4
          outline-none
          focus:border-indigo-600
          "

        >

          <option value="">
            All Categories
          </option>


          <option value="Infrastructure">
            Infrastructure
          </option>


          <option value="Facility">
            Facility
          </option>


          <option value="Security">
            Security
          </option>


          <option value="Finance">
            Finance
          </option>


        </select>





        {/* Status */}


        <select

          value={status}

          onChange={(e)=>
            setStatus(
              e.target.value
            )
          }

          className="
          h-12
          rounded-xl
          border border-slate-200 dark:border-slate-700
          border-slate-300 dark:border-slate-700
          px-4
          outline-none
          focus:border-indigo-600
          "

        >

          <option value="">
            All Status
          </option>


          <option value="Active">
            Active
          </option>


          <option value="Closed">
            Closed
          </option>


        </select>





        {/* Sort */}


        <div
          className="
          flex
          gap-3
          "
        >

          <select

            value={sort}

            onChange={(e)=>
              setSort(
                e.target.value
              )
            }

            className="
            h-12
            flex-1
            rounded-xl
            border border-slate-200 dark:border-slate-700
            border-slate-300 dark:border-slate-700
            px-4
            outline-none
            focus:border-indigo-600
            "

          >

            <option value="newest">
              Newest
            </option>


            <option value="votes">
              Most Votes
            </option>


            <option value="expiry">
              Expiring Soon
            </option>


          </select>



          <Button

            variant="outline"

            onClick={
              resetFilters
            }

          >

            <RotateCcw size={18}/>

          </Button>


        </div>


      </div>


    </Card>

  );

};


export default PollFilters;