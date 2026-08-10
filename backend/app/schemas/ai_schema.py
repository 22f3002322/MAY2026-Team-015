"""Pydantic DTOs for Module 1.10 — AI Community Intelligence."""
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


PriorityLiteral = Literal["low", "medium", "high", "critical"]


class ClassifyRequest(BaseModel):
    description: str = Field(min_length=3, max_length=5000)
    category_hints: Optional[list[str]] = None


class AlternativeCategory(BaseModel):
    category_id: int
    category_name: str


class ClassifyResponse(BaseModel):
    category_id: int
    category_name: str
    priority: PriorityLiteral
    confidence: float
    rationale: str
    alternative_categories: list[AlternativeCategory] = Field(default_factory=list)


class MaintenanceStaffListItem(BaseModel):
    staff_id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_available: bool
    open_task_count: int


class StaffRecommendationItem(BaseModel):
    staff_id: int
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_available: bool
    open_task_count: int
    reason: str


class StaffRecommendationsResponse(BaseModel):
    complaint_id: int
    recommendations: list[StaffRecommendationItem]


class SearchResultItem(BaseModel):
    entity_type: Literal["complaint", "announcement"]
    entity_id: int
    title: str
    snippet: str
    score_hint: Optional[float] = None


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    reranked: bool = False


class ComplaintSummaryRequest(BaseModel):
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    block_id: Optional[int] = None


class ComplaintSummaryMetrics(BaseModel):
    total: int
    by_status: dict[str, int]
    by_priority: dict[str, int]
    by_category: dict[str, int]
    oldest_open_days: Optional[int] = None
    top_flats: list[dict] = Field(default_factory=list)


class ComplaintSummaryResponse(BaseModel):
    metrics: ComplaintSummaryMetrics
    headline: str
    narrative: str
    insights: list[str]
    recommended_actions: list[str]
    cached: bool = False


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class ChatCitation(BaseModel):
    entity_type: Literal["complaint", "announcement"]
    entity_id: int


class ChatResponse(BaseModel):
    reply: str
    citations: list[ChatCitation] = Field(default_factory=list)
    refused: bool = False
