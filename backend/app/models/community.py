"""
Community Engagement component (component design doc section 1.9).
Adapted from the reference community_model.py.

BUGFIX vs reference: community_schema.py's PollUpdate had an `is_active`
field but the Poll model had no such column at all -- `setattr(poll,
"is_active", value)` in the update service would have silently set an
unmapped Python attribute that SQLAlchemy never persists, so
deactivating a poll early would appear to succeed (200 OK) and do
nothing. Added the column for real, and use it (together with
start_date/end_date) to gate voting -- see community_service.py.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import ist_now


class Poll(Base):
    __tablename__ = "polls"

    poll_id = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(Text, nullable=False)
    allow_multiple_votes = Column(Boolean, nullable=False, default=False)
    anonymous = Column(Boolean, nullable=False, default=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=ist_now, nullable=False)

    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("PollVote", back_populates="poll", cascade="all, delete-orphan")


class PollOption(Base):
    __tablename__ = "poll_options"

    option_id = Column(Integer, primary_key=True, autoincrement=True)
    poll_id = Column(Integer, ForeignKey("polls.poll_id"), nullable=False)
    option_text = Column(String(200), nullable=False)

    poll = relationship("Poll", back_populates="options")
    votes = relationship("PollVote", back_populates="option", cascade="all, delete-orphan")


class PollVote(Base):
    __tablename__ = "poll_votes"

    vote_id = Column(Integer, primary_key=True, autoincrement=True)
    poll_id = Column(Integer, ForeignKey("polls.poll_id"), nullable=False)
    option_id = Column(Integer, ForeignKey("poll_options.option_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    voted_at = Column(DateTime, default=ist_now, nullable=False)

    poll = relationship("Poll", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")
    user = relationship("User", back_populates="poll_votes")