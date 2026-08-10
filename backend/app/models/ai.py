"""
Module 1.10 — AI Community Intelligence audit log.

Stores truncated inference metadata for classify / recommend / search /
summary / chat. Not a vector store; schema follows the same Base +
ist_now conventions as the rest of app.models.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.core.database import Base
from app.models.mixins import ist_now


class AiInferenceLog(Base):
    __tablename__ = "ai_inference_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feature = Column(String(40), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True, index=True)
    entity_type = Column(String(40), nullable=True)
    entity_id = Column(Integer, nullable=True)
    request_hash = Column(String(64), nullable=True)
    model = Column(String(100), nullable=True)
    latency_ms = Column(Integer, nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=ist_now, nullable=False)
