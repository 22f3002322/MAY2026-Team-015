"""
Community Engagement component (design doc 1.9).

Split out from the reference's confusing `notification_service as
community_service` import alias in community.py -- that was really just
poll logic living in the wrong module under a borrowed name. This is its
own service.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.community import Poll, PollOption, PollVote
from app.models.mixins import ist_now
from app.schemas.community_schema import PollCreate, PollUpdate
from app.services import notification_service
from app.utils.api_error import BadRequest, Conflict, NotFound

_LOAD_OPTIONS = (selectinload(Poll.options),)


def create_poll(db: Session, payload: PollCreate) -> Poll:
    poll = Poll(
        question=payload.question,
        allow_multiple_votes=payload.allow_multiple_votes,
        anonymous=payload.anonymous,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(poll)
    db.flush()
    for option in payload.options:
        db.add(PollOption(poll_id=poll.poll_id, option_text=option.option_text))
    db.commit()

    notification_service.notify_all_residents(
        db,
        notification_type="poll",
        title="New poll: have your say",
        message=poll.question[:500],
    )

    result = db.execute(select(Poll).where(Poll.poll_id == poll.poll_id).options(*_LOAD_OPTIONS))
    return result.scalar_one()


def list_polls(db: Session) -> list[Poll]:
    result = db.execute(select(Poll).options(*_LOAD_OPTIONS).order_by(Poll.start_date.desc()))
    return list(result.scalars().all())


def get_poll(db: Session, poll_id: int) -> Poll:
    result = db.execute(select(Poll).where(Poll.poll_id == poll_id).options(*_LOAD_OPTIONS))
    poll = result.scalar_one_or_none()
    if poll is None:
        raise NotFound("Poll not found.")
    return poll


def update_poll(db: Session, poll_id: int, payload: PollUpdate) -> Poll:
    poll = get_poll(db, poll_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(poll, field, value)
    db.commit()
    result = db.execute(select(Poll).where(Poll.poll_id == poll_id).options(*_LOAD_OPTIONS))
    return result.scalar_one()


def cast_vote(db: Session, poll_id: int, option_id: int, user_id: int) -> PollVote:
    """
    BUGFIX vs reference: the reference vote() only checked
    allow_multiple_votes -- nothing stopped voting on a poll that hadn't
    started yet, had already ended, or had been deactivated early (a
    no-op in the reference anyway, since Poll.is_active didn't exist as
    a real column -- see models/community.py).

    BUGFIX (CODE_REVIEW.md 2): get_poll() below used to be a plain,
    unlocked SELECT -- two concurrent votes from the same user on a
    single-vote poll could both pass the "already voted" check before
    either commits, producing two PollVote rows for one user on a poll
    that's supposed to disallow that. Locking the poll row for the
    duration of the check + insert closes the gap: the second
    concurrent request blocks here until the first commits, then
    re-checks and correctly hits the Conflict below.
    """
    poll = (
        db.query(Poll)
        .options(*_LOAD_OPTIONS)
        .filter(Poll.poll_id == poll_id)
        .with_for_update()
        .first()
    )
    if poll is None:
        raise NotFound("Poll not found.")

    if not poll.is_active:
        raise BadRequest("This poll is closed.")

    today = ist_now().date()
    if today < poll.start_date:
        raise BadRequest("Voting hasn't opened for this poll yet.")
    if today > poll.end_date:
        raise BadRequest("Voting has closed for this poll.")

    option = next((o for o in poll.options if o.option_id == option_id), None)
    if option is None:
        raise NotFound("Poll option not found.")

    if not poll.allow_multiple_votes:
        existing = (
            db.query(PollVote)
            .filter(PollVote.poll_id == poll_id, PollVote.user_id == user_id)
            .first()
        )
        if existing is not None:
            raise Conflict("You have already voted on this poll.")

    vote = PollVote(poll_id=poll_id, option_id=option_id, user_id=user_id)
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote


def get_results(db: Session, poll_id: int) -> dict:
    poll = get_poll(db, poll_id)
    counts = {opt.option_id: 0 for opt in poll.options}
    total = 0
    for vote in poll.votes:
        counts[vote.option_id] = counts.get(vote.option_id, 0) + 1
        total += 1

    return {
        "poll_id": poll.poll_id,
        "question": poll.question,
        "total_votes": total,
        "results": [
            {"option_id": opt.option_id, "option_text": opt.option_text, "vote_count": counts.get(opt.option_id, 0)}
            for opt in poll.options
        ],
    }