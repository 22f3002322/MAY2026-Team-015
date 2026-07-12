import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultPolls = [
  {
    id: 1,
    pollId: "POLL-1001",
    question:
      "Should we install EV charging stations?",
    category: "Infrastructure",
    options: [
      { id: 1, text: "Yes", votes: 24 },
      { id: 2, text: "No", votes: 6 },
    ],
    totalVotes: 30,
    status: "Active",
    endDate: "31 Dec 2026",
    createdBy: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    pollId: "POLL-1002",
    question:
      "Annual cultural event in December?",
    category: "Events",
    options: [
      { id: 1, text: "Yes", votes: 18 },
      { id: 2, text: "No", votes: 9 },
    ],
    totalVotes: 27,
    status: "Closed",
    endDate: "15 Jul 2026",
    createdBy: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const usePollStore = create(
  persist(
    (set) => ({
      polls: defaultPolls,

      addPoll: (poll) =>
        set((state) => ({
          polls: [
            {
              ...poll,
              id: Date.now(),
              pollId: `POLL-${Date.now()}`,
              totalVotes: 0,
              createdAt:
                new Date().toISOString(),
              updatedAt:
                new Date().toISOString(),
            },
            ...state.polls,
          ],
        })),

      updatePoll: (poll) =>
        set((state) => ({
          polls: state.polls.map((item) =>
            item.id === poll.id
              ? {
                  ...item,
                  ...poll,
                  updatedAt:
                    new Date().toISOString(),
                }
              : item
          ),
        })),

      deletePoll: (id) =>
        set((state) => ({
          polls: state.polls.filter(
            (poll) => poll.id !== id
          ),
        })),

      votePoll: (pollId, optionId) =>
        set((state) => ({
          polls: state.polls.map((poll) => {
            if (poll.id !== pollId)
              return poll;

            return {
              ...poll,
              totalVotes:
                poll.totalVotes + 1,
              updatedAt:
                new Date().toISOString(),
              options: poll.options.map(
                (option) =>
                  option.id === optionId
                    ? {
                        ...option,
                        votes:
                          option.votes + 1,
                      }
                    : option
              ),
            };
          }),
        })),
    }),
    {
      name: "poll-storage",
    }
  )
);

export default usePollStore;