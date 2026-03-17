import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.cards import SPREADS, draw_cards
from backend.engine import TarotReadingEngine
from backend.models import LLMConfig, ReadingRequest, TarotCard, UserProfile


def _response(status, data):
    return {
        "statusCode": status,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "Content-Type",
            "access-control-allow-methods": "GET, POST, OPTIONS"
        },
        "body": json.dumps(data)
    }


def handler(request):
    try:
        if getattr(request, 'method', 'GET') == 'OPTIONS':
            return _response(204, {})
        body = request.body if hasattr(request, 'body') else b''
        if isinstance(body, bytes):
            payload = json.loads(body.decode('utf-8') or '{}')
        elif isinstance(body, str):
            payload = json.loads(body or '{}')
        else:
            payload = body or {}
        spread_key = payload.get('spreadKey', 'three')
        if spread_key not in SPREADS:
            return _response(400, {'ok': False, 'error': 'Invalid spread'})
        cards = [TarotCard(**row) for row in draw_cards(spread_key)]
        request_obj = ReadingRequest(
            question=payload['question'].strip(),
            reader_style=payload.get('readerStyle', 'relationship_expert'),
            spread_key=spread_key,
            spread_name=SPREADS[spread_key]['name'],
            user=UserProfile(
                name=payload.get('name') or 'Seeker',
                focus=payload.get('focus') or 'general',
                energy=payload.get('energy') or 'uncertain',
                age_range=payload.get('ageRange'),
                relationship_status=payload.get('relationshipStatus'),
                interests=payload.get('interests') or [],
            ),
            cards=cards,
            ritual_notes={
                'desired_answer': payload.get('desiredAnswer'),
                'feared_truth': payload.get('fearedTruth'),
                'situation_label': payload.get('situationLabel'),
            },
        )
        engine = TarotReadingEngine(LLMConfig(model=os.getenv('OPENAI_MODEL', 'gpt-4.1-mini')))
        result = engine.run(request_obj)
        return _response(200, {'ok': True, **result})
    except KeyError as exc:
        return _response(400, {'ok': False, 'error': f'Missing field: {exc}'})
    except RuntimeError as exc:
        return _response(400, {'ok': False, 'error': str(exc)})
    except Exception as exc:
        return _response(500, {'ok': False, 'error': str(exc)})
