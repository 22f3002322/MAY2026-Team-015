import { History, Trophy, Users, CalendarDays } from "lucide-react";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";

const PreviousPolls = ({ polls }) => {
  const closedPolls = (polls || []).filter(
    (poll) => poll.status === "Closed" || poll.is_active === false
  );

  if (closedPolls.length === 0) {
    return (
      <Card className="py-14">
        <div className="text-center">
          <History size={45} className="mx-auto text-slate-400" />
          <h3 className="mt-4 text-xl font-semibold">No Previous Polls</h3>
          <p className="mt-2 text-slate-500">
            Completed polls will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {closedPolls.map((poll) => {
        const options = poll.options || [];
        const winner =
          options.length > 0
            ? options.reduce((prev, current) =>
                (prev.votes || 0) > (current.votes || 0) ? prev : current
              )
            : null;

        return (
          <Card key={poll.id}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {poll.title || poll.question}
                  </h2>
                  <Badge variant="secondary">Closed</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
                  {poll.expiryDate ? (
                    <span className="flex items-center gap-2 dark:text-slate-100">
                      <CalendarDays size={16} />
                      {poll.expiryDate}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2 dark:text-slate-100">
                    <Users size={16} />
                    {poll.totalVotes || 0} Votes
                  </span>
                </div>
              </div>

              {winner ? (
                <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/30">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-600" />
                    <div>
                      <p className="text-xs text-slate-500">Winner</p>
                      <p className="font-bold">{winner.text || "—"}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PreviousPolls;
