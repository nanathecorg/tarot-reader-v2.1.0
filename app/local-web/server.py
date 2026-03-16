from __future__ import annotations

import json
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from backend.cards import SPREADS, draw_cards
from backend.engine import TarotReadingEngine
from backend.models import LLMConfig, ReadingRequest, TarotCard, UserProfile

ROOT = Path(__file__).resolve().parent
PORT = int(os.getenv('PORT', '4173'))


class TarotHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _json(self, data: dict, status: int = 200) -> None:
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/health':
            self._json({'ok': True, 'has_api_key': bool(os.getenv('OPENAI_API_KEY'))})
            return
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/reading':
            self._json({'error': 'not found'}, status=404)
            return

        try:
            length = int(self.headers.get('Content-Length', '0'))
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
            spread_key = payload.get('spreadKey', 'three')
            if spread_key not in SPREADS:
                raise ValueError('Invalid spread')

            cards = [TarotCard(**row) for row in draw_cards(spread_key)]
            request = ReadingRequest(
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
            result = engine.run(request)
            self._json({'ok': True, **result})
        except KeyError as exc:
            print('reading error: missing field', exc, flush=True)
            self._json({'ok': False, 'error': f'Missing field: {exc}'}, status=400)
        except RuntimeError as exc:
            print('reading runtime error:', exc, flush=True)
            self._json({'ok': False, 'error': str(exc)}, status=400)
        except Exception as exc:
            print('reading fatal error:', repr(exc), flush=True)
            self._json({'ok': False, 'error': str(exc)}, status=500)


def main() -> None:
    server = ThreadingHTTPServer(('127.0.0.1', PORT), TarotHandler)
    print(f'Tarot Reader server running at http://127.0.0.1:{PORT}')
    server.serve_forever()


if __name__ == '__main__':
    main()
