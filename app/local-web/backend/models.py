from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

Orientation = Literal['upright', 'reversed']
ReaderStyle = Literal['relationship_expert', 'calm_logical_critic']


@dataclass
class UserProfile:
    name: str = 'Seeker'
    focus: str = 'general'
    energy: str = 'uncertain'
    age_range: str | None = None
    relationship_status: str | None = None
    history_summary: str | None = None
    interests: list[str] = field(default_factory=list)


@dataclass
class TarotCard:
    name: str
    position: str
    orientation: Orientation
    meanings: dict[str, str]


@dataclass
class ReadingRequest:
    question: str
    reader_style: ReaderStyle
    spread_key: str
    spread_name: str
    user: UserProfile
    cards: list[TarotCard]
    ritual_notes: dict[str, Any] = field(default_factory=dict)


@dataclass
class AnalysisBrief:
    explicit_question: str
    likely_real_question: str
    emotional_state: str
    hidden_desire: str
    hidden_fear: str
    answer_style: str
    directness_level: str
    reading_focus: list[str]
    avoid: list[str]
    notes: str
    raw: str | None = None


@dataclass
class LLMConfig:
    model: str = 'gpt-4.1-mini'
    api_base: str = 'https://api.openai.com/v1'
    api_key_env: str = 'OPENAI_API_KEY'
    call1_temperature: float = 0.5
    call2_temperature: float = 0.9
    max_tokens: int = 1400
