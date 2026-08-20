from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PollOptionBase(BaseModel):
    option_text: str = Field(min_length=1, max_length=200)


class PollOptionCreate(PollOptionBase):
    pass


class PollOptionOut(PollOptionBase):
    model_config = ConfigDict(from_attributes=True)

    option_id: int
    poll_id: int


class PollBase(BaseModel):
    question: str = Field(min_length=1)
    allow_multiple_votes: Optional[bool] = False
    anonymous: Optional[bool] = False
    start_date: date
    end_date: date


class PollCreate(PollBase):
    options: list[PollOptionCreate] = Field(min_length=2)

    @model_validator(mode="after")
    def _check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class PollUpdate(BaseModel):
    question: Optional[str] = None
    allow_multiple_votes: Optional[bool] = None
    anonymous: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    # BUGFIX: this field existed in the reference schema, but the
    # reference Poll model had no is_active column at all -- setting it
    # was a silent no-op. Poll.is_active is now a real column (see
    # models/community.py) and voting checks it.
    is_active: Optional[bool] = None


class PollOut(PollBase):
    model_config = ConfigDict(from_attributes=True)

    poll_id: int
    is_active: bool
    total_votes: int = 0
    options: list[PollOptionOut] = []


class PollVoteBase(BaseModel):
    option_id: int


class PollVoteCreate(PollVoteBase):
    pass


class PollVoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vote_id: int
    poll_id: int
    option_id: int
    user_id: int
    voted_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# "Display live voting results after poll completion" (component design
# doc 1.9) -- the reference had a vote endpoint but no way to ever read
# the results back.
# --------------------------------------------------------------------------
class PollOptionResult(BaseModel):
    option_id: int
    option_text: str
    vote_count: int


class PollResultsOut(BaseModel):
    poll_id: int
    question: str
    total_votes: int
    results: list[PollOptionResult]