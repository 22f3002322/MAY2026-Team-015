from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin_or_committee, require_verified_resident
from app.models.auth import User
from app.services import community_service
from app.schemas.community_schema import PollCreate, PollOut, PollResultsOut, PollUpdate, PollVoteCreate, PollVoteOut
from app.utils.api_response import success_response

# BUGFIX: reference used require_admin only for create/update. Switched
# to require_admin_or_committee for the same reason as
# communication_router.py's announcements -- consistency with every
# other admin-capable module in this app.
router = APIRouter(prefix="/api/v1/polls", tags=["polls"])


@router.post("")
def create_poll(payload: PollCreate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    poll = community_service.create_poll(db, payload)
    return success_response(data=PollOut.model_validate(poll), message="Poll created.")


@router.get("")
def list_polls(_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    polls = community_service.list_polls(db)
    return success_response(data=[PollOut.model_validate(p) for p in polls])


@router.get("/{poll_id}")
def get_poll(poll_id: int, _user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    poll = community_service.get_poll(db, poll_id)
    return success_response(data=PollOut.model_validate(poll))


@router.patch("/{poll_id}")
def update_poll(poll_id: int, payload: PollUpdate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    poll = community_service.update_poll(db, poll_id, payload)
    return success_response(data=PollOut.model_validate(poll), message="Poll updated.")


@router.post("/{poll_id}/vote")
def vote(poll_id: int, payload: PollVoteCreate, current_user: User = Depends(require_verified_resident), db: Session = Depends(get_db)):
    vote_row = community_service.cast_vote(db, poll_id, payload.option_id, current_user.user_id)
    return success_response(data=PollVoteOut.model_validate(vote_row), message="Vote recorded.")


@router.get("/{poll_id}/results")
def get_results(poll_id: int, _user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    BUGFIX / gap-fill: "Display live voting results" is an explicit
    requirement (component design doc 1.9), but the reference had a vote
    endpoint and nothing to ever read results back with. Anonymous polls
    (Poll.anonymous) still show aggregate counts per option -- "anonymous"
    means votes aren't attributed to a voter, not that totals are hidden.
    """
    results = community_service.get_results(db, poll_id)
    return success_response(data=PollResultsOut(**results))