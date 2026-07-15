import {
  useState,
} from "react";

import {
  CheckCircle,
  Vote,
} from "lucide-react";


import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

import usePollStore from "../../../store/pollStore";



const VoteModal = ({
  poll,
  onClose,
}) => {


  const votePoll =
    usePollStore(
      (state) =>
        state.votePoll
    );


  const [
    selectedOption,
    setSelectedOption,
  ] = useState(null);



  if(!poll)
    return null;




  const handleSubmit = () => {


    if(!selectedOption)
      return;



    votePoll(
      poll.id,
      selectedOption
    );


    onClose();


  };




  return (

    <Modal

      open={!!poll}

      title="Cast Your Vote"

      onClose={onClose}

    >


      <div
        className="
        space-y-6
        "
      >


        {/* Question */}


        <div>

          <h2
            className="
            text-xl
            font-bold
            text-slate-800
            dark:text-slate-100
            "
          >

            {poll.title}

          </h2>


          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
            "
          >

            {poll.description}

          </p>


        </div>





        {/* Options */}


        <div
          className="
          space-y-3
          "
        >


          {
            poll.options.map(
              (option)=>(


                <label

                  key={
                    option.id
                  }

                  className={`
                  flex
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-xl
                  border
                  p-4
                  transition

                  ${
                    selectedOption === option.id

                    ?
                    "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"

                    :
                    "border-slate-200 dark:border-slate-700 dark:bg-slate-800/50"
                  }

                  `}

                >


                  <input

                    type="radio"

                    name="poll"

                    checked={
                      selectedOption === option.id
                    }

                    onChange={() =>
                      setSelectedOption(
                        option.id
                      )
                    }

                    className="
                    h-5
                    w-5
                    "
                  />



                  <span
                    className="
                    font-medium
                    text-slate-700
                    dark:text-slate-200
                    "
                  >

                    {option.text}

                  </span>


                </label>


              )
            )

          }


        </div>





        {/* Footer */}


        <div
          className="
          flex
          justify-end
          gap-3
          "
        >


          <Button

            variant="outline"

            onClick={onClose}

          >

            Cancel

          </Button>




          <Button

            disabled={
              !selectedOption
            }

            onClick={
              handleSubmit
            }

          >

            <CheckCircle size={18}/>

            Submit Vote

          </Button>


        </div>


      </div>


    </Modal>

  );

};


export default VoteModal;