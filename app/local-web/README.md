# Tarot Reader — Local Web v2.0.0

This is the shipping local-web build for Tarot Reader.

## What it is now
- real Python backend
- OpenAI-backed two-call tarot flow
  - call 1: analyze the user and question
  - call 2: generate the final reading from cards + brief
- reader styles:
  - Relationship Expert
  - Calm Logical Critic
- richer ritual intake prompts
- local card draw + local card images

## Run locally

From this folder:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

## Required env
Set before running:

```bash
export OPENAI_API_KEY=your_key_here
```

Optional:

```bash
export OPENAI_MODEL=gpt-4.1-mini
```

## Notes
- Without `OPENAI_API_KEY`, the backend will return an error instead of a reading.
- Card draw happens in the app/backend; the interpretation comes from the two-call OpenAI prompt flow.
