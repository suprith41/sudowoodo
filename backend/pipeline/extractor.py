import json
import os
from functools import lru_cache
from pathlib import Path

from openai import OpenAI


MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"
BASE_URL = "https://api.groq.com/openai/v1"
PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "extraction.txt"


@lru_cache(maxsize=1)
def load_extraction_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8").strip()


def _build_client() -> OpenAI:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing. Add it to backend/.env before running the API.")

    return OpenAI(api_key=api_key, base_url=BASE_URL)


def _build_messages(document_payload: dict[str, object], schema: object) -> list[dict[str, object]]:
    pages = document_payload["pages"]
    intro_text = (
        f"{load_extraction_prompt()}\n\n"
        f"Filename: {document_payload['filename']}\n"
        f"Page count: {len(pages)}\n\n"
        "Use this target JSON schema/example exactly. Keep the same top-level shape and keys:\n"
        f"{json.dumps(schema, indent=2)}"
    )

    content: list[dict[str, object]] = [{"type": "text", "text": intro_text}]
    for page in pages:
        content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:{page['mime_type']};base64,{page['base64_data']}",
                },
            }
        )

    return [{"role": "user", "content": content}]


def extract_with_groq(document_payload: dict[str, object], schema: object) -> str:
    client = _build_client()
    request_payload = {
        "model": MODEL_NAME,
        "messages": _build_messages(document_payload=document_payload, schema=schema),
        "temperature": 0,
    }
    if isinstance(schema, dict):
        request_payload["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(
        **request_payload,
    )

    message_content = response.choices[0].message.content
    if not message_content:
        raise RuntimeError("The model returned an empty response.")

    return message_content
