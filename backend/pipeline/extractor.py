import json
import os
from functools import lru_cache
from pathlib import Path

from openai import BadRequestError, OpenAI


MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"
BASE_URL = "https://api.groq.com/openai/v1"
PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "extraction.txt"
SCHEMA_DETECTION_PROMPT = (
    "Look at this document and return ONLY a JSON schema object with the fields you can see. "
    "Return field names as keys and the data type as values (string, float, int, date, array). "
    "No explanation."
)


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
        "This document has multiple pages. Extract data across ALL pages. "
        "For tables that span multiple pages, combine all rows into a single array.\n\n"
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


def _extract_error_text(exc: Exception) -> str:
    error_parts = [str(exc)]
    message = getattr(exc, "message", None)
    if isinstance(message, str):
        error_parts.append(message)

    body = getattr(exc, "body", None)
    if body is not None:
        try:
            error_parts.append(json.dumps(body))
        except TypeError:
            error_parts.append(str(body))

    return " ".join(part for part in error_parts if part).lower()


def _is_token_limit_error(exc: Exception) -> bool:
    error_text = _extract_error_text(exc)
    token_limit_phrases = (
        "token limit",
        "too many tokens",
        "context length",
        "context window",
        "maximum context length",
        "prompt is too long",
        "request is too large",
    )
    return any(phrase in error_text for phrase in token_limit_phrases)


def _request_extraction(document_payload: dict[str, object], schema: object) -> str:
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


def extract_with_groq(document_payload: dict[str, object], schema: object) -> tuple[str, int, str | None]:
    pages = document_payload["pages"]
    fallback_page_count = min(5, len(pages))

    try:
        return _request_extraction(document_payload=document_payload, schema=schema), len(pages), None
    except BadRequestError as exc:
        if not _is_token_limit_error(exc) or len(pages) <= fallback_page_count:
            raise RuntimeError(str(exc)) from exc

    fallback_payload = {
        **document_payload,
        "pages": pages[:fallback_page_count],
    }
    fallback_warning = (
        "Extraction retried with only the first "
        f"{fallback_page_count} pages due to model token limits."
    )

    try:
        raw_output = _request_extraction(document_payload=fallback_payload, schema=schema)
    except BadRequestError as exc:
        raise RuntimeError(str(exc)) from exc

    return raw_output, fallback_page_count, fallback_warning


def detect_schema(pages_b64: list[str]) -> dict[str, object]:
    if not pages_b64:
        raise RuntimeError("No document pages were provided for schema detection.")

    client = _build_client()
    content: list[dict[str, object]] = [{"type": "text", "text": SCHEMA_DETECTION_PROMPT}]
    for image_url in pages_b64:
        content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url,
                },
            }
        )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": content}],
        temperature=0,
        response_format={"type": "json_object"},
    )

    message_content = response.choices[0].message.content
    if not message_content:
        raise RuntimeError("The model returned an empty schema response.")

    try:
        detected_schema = json.loads(message_content)
    except json.JSONDecodeError as exc:
        raise RuntimeError("The model returned invalid JSON for the detected schema.") from exc

    if not isinstance(detected_schema, dict):
        raise RuntimeError("The detected schema must be a JSON object.")

    return detected_schema
