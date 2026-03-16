from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request

from .models import LLMConfig


class OpenAICompatibleClient:
    def __init__(self, config: LLMConfig):
        self.config = config

    def chat(self, messages: list[dict[str, str]], temperature: float, response_format: dict | None = None) -> str:
        api_key = os.getenv(self.config.api_key_env)
        if not api_key:
            raise RuntimeError(f'Missing API key in env var: {self.config.api_key_env}')

        payload = {
            'model': self.config.model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': self.config.max_tokens,
        }
        if response_format:
            payload['response_format'] = response_format

        last_error = None
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    f"{self.config.api_base.rstrip('/')}/chat/completions",
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {api_key}',
                    },
                    method='POST',
                )
                with urllib.request.urlopen(req, timeout=90) as resp:
                    body = json.loads(resp.read().decode('utf-8'))
                return body['choices'][0]['message']['content']
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode('utf-8', errors='ignore')
                last_error = f'OpenAI HTTP {exc.code}: {detail[:500]}'
                if exc.code in (429, 500, 502, 503, 504) and attempt < 2:
                    time.sleep(2 * (attempt + 1))
                    continue
                raise RuntimeError(last_error) from exc
            except Exception as exc:
                last_error = str(exc)
                if attempt < 2:
                    time.sleep(2 * (attempt + 1))
                    continue
                raise RuntimeError(f'OpenAI request failed: {last_error}') from exc
        raise RuntimeError(last_error or 'OpenAI request failed')
