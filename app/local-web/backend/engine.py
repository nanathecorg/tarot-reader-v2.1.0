from __future__ import annotations

import json
from dataclasses import asdict

from .models import AnalysisBrief, LLMConfig, ReadingRequest
from .openai_client import OpenAICompatibleClient
from .prompts import CALL1_SYSTEM, CALL2_SYSTEM, STYLE_PROMPTS


class TarotReadingEngine:
    def __init__(self, config: LLMConfig | None = None):
        self.config = config or LLMConfig()
        self.client = OpenAICompatibleClient(self.config)

    def build_call1_messages(self, request: ReadingRequest) -> list[dict[str, str]]:
        payload = {
            'user_profile': asdict(request.user),
            'question': request.question,
            'spread_key': request.spread_key,
            'spread_name': request.spread_name,
            'reader_style': request.reader_style,
            'ritual_notes': request.ritual_notes,
        }
        return [
            {'role': 'system', 'content': CALL1_SYSTEM},
            {'role': 'user', 'content': json.dumps(payload, indent=2)},
        ]

    def build_call2_messages(self, request: ReadingRequest, brief: AnalysisBrief) -> list[dict[str, str]]:
        payload = {
            'question': request.question,
            'reader_style': request.reader_style,
            'analysis_brief': asdict(brief) | {'raw': None},
            'spread': {
                'key': request.spread_key,
                'name': request.spread_name,
            },
            'cards': [asdict(card) for card in request.cards],
            'ritual_notes': request.ritual_notes,
            'output_requirements': {
                'be concrete and graspable': True,
                'avoid empty abstraction': True,
                'anti_creepy': True,
                'give action guidance when useful': True,
            },
        }
        return [
            {'role': 'system', 'content': CALL2_SYSTEM + '\n\n' + STYLE_PROMPTS[request.reader_style]},
            {'role': 'user', 'content': json.dumps(payload, indent=2)},
        ]

    def analyze_user(self, request: ReadingRequest) -> AnalysisBrief:
        raw = self.client.chat(
            self.build_call1_messages(request),
            temperature=self.config.call1_temperature,
            response_format={'type': 'json_object'},
        )
        data = json.loads(raw)
        return AnalysisBrief(raw=raw, **data)

    def generate_reading(self, request: ReadingRequest, brief: AnalysisBrief) -> str:
        return self.client.chat(
            self.build_call2_messages(request, brief),
            temperature=self.config.call2_temperature,
        )

    def run(self, request: ReadingRequest) -> dict:
        brief = self.analyze_user(request)
        final_reading = self.generate_reading(request, brief)
        return {
            'brief': asdict(brief),
            'reading': final_reading,
            'cards': [asdict(card) for card in request.cards],
            'spread_name': request.spread_name,
            'reader_style': request.reader_style,
        }
