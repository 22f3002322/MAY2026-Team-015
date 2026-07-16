import { create } from "zustand";
import { persist } from "zustand/middleware";


const defaultPolls = [

  {
    id: 1,

    pollId: "POLL-1001",

    question:
      "Should we install EV charging stations?",

    category:
      "Infrastructure",


    options: [

      {
        id: 1,
        text: "Yes",
        votes: 24,
      },

      {
        id: 2,
        text: "No",
        votes: 6,
      },

    ],


    totalVotes: 30,


    status:
      "Active",


    userVoted:
      false,


    endDate:
      "31 Dec 2026",


    createdBy:
      "Admin",


    createdAt:
      new Date().toISOString(),


    updatedAt:
      new Date().toISOString(),

  },


  {
    id: 2,

    pollId:
      "POLL-1002",


    question:
      "Annual cultural event in December?",


    category:
      "Events",


    options:[

      {
        id:1,
        text:"Yes",
        votes:18,
      },

      {
        id:2,
        text:"No",
        votes:9,
      },

    ],


    totalVotes:
      27,


    status:
      "Closed",


    userVoted:
      false,


    endDate:
      "15 Jul 2026",


    createdBy:
      "Admin",


    createdAt:
      new Date().toISOString(),


    updatedAt:
      new Date().toISOString(),

  },

];



const usePollStore = create(

persist(

(set,get)=>(

{


polls:
defaultPolls,




// ============================
// ADMIN ACTIONS
// ============================


// Create poll

addPoll:(poll)=>

set((state)=>({

polls:[


{

...poll,


id:
Date.now(),


pollId:
`POLL-${Date.now()}`,


totalVotes:
0,


userVoted:
false,


status:
"Active",


createdAt:
new Date().toISOString(),


updatedAt:
new Date().toISOString(),


},

...state.polls,


]


})),






// Update poll


updatePoll:(updatedPoll)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>

poll.id===updatedPoll.id

?

{

...poll,

...updatedPoll,

updatedAt:
new Date().toISOString(),

}

:

poll

)


})),







// Delete poll


deletePoll:(id)=>

set((state)=>({


polls:

state.polls.filter(

(poll)=>

poll.id!==id

)


})),







// Close poll


closePoll:(id)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>

poll.id===id

?

{

...poll,

status:
"Closed",

updatedAt:
new Date().toISOString(),

}

:

poll

)


})),







// Reopen poll


reopenPoll:(id)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>

poll.id===id

?

{

...poll,

status:
"Active",

updatedAt:
new Date().toISOString(),

}

:

poll

)


})),







// Add option


addOption:(pollId,text)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>

poll.id===pollId

?

{

...poll,


options:[

...poll.options,


{

id:
Date.now(),

text,

votes:
0,

}

]

}

:

poll


)


})),







// Remove option


removeOption:(pollId,optionId)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>

poll.id===pollId

?

{

...poll,

options:

poll.options.filter(

(option)=>

option.id!==optionId

)

}

:

poll

)


})),







// ============================
// RESIDENT ACTIONS
// ============================



// Vote


votePoll:(pollId,optionId)=>

set((state)=>({


polls:

state.polls.map(

(poll)=>{


if(
poll.id!==pollId
)

return poll;



if(
poll.status==="Closed"
)

return poll;



if(
poll.userVoted
)

return poll;





return {


...poll,


userVoted:
true,


totalVotes:
poll.totalVotes+1,


updatedAt:
new Date().toISOString(),



options:

poll.options.map(

(option)=>

option.id===optionId

?

{

...option,

votes:
option.votes+1,

}

:

option


)


};


}

)


})),








// Get poll by ID


getPollById:(id)=>

get()

.polls

.find(

(poll)=>

poll.id===id

),







// Statistics


getPollStats:()=>{


const polls =
get().polls;


return {


totalPolls:
polls.length,


activePolls:

polls.filter(

(p)=>

p.status==="Active"

).length,



closedPolls:

polls.filter(

(p)=>

p.status==="Closed"

).length,



totalVotes:

polls.reduce(

(sum,p)=>

sum+p.totalVotes,

0

),


};


},








// Reset


resetPolls:()=>set({

polls:
defaultPolls,

}),



}

),


{

name:
"poll-storage",

}

)

);


export default usePollStore;