import json
import os

def handler(request):
    return {
        "statusCode": 200,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*"
        },
        "body": json.dumps({"ok": True, "has_api_key": bool(os.getenv("OPENAI_API_KEY"))})
    }
