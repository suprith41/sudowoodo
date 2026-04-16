import json
import re
from typing import Any


FENCE_PATTERN = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def _strip_code_fences(raw_output: str) -> str:
    return FENCE_PATTERN.sub("", raw_output.strip())


def _extract_json_slice(raw_output: str) -> str:
    first_object = raw_output.find("{")
    first_array = raw_output.find("[")
    start_candidates = [index for index in (first_object, first_array) if index != -1]
    if not start_candidates:
        return raw_output

    start_index = min(start_candidates)
    end_object = raw_output.rfind("}")
    end_array = raw_output.rfind("]")
    end_index = max(end_object, end_array)
    if end_index == -1 or end_index < start_index:
        return raw_output[start_index:]

    return raw_output[start_index : end_index + 1]


def _parse_json(raw_output: str) -> Any:
    cleaned_text = _strip_code_fences(raw_output)

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return json.loads(_extract_json_slice(cleaned_text))


def _normalize_strings(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _normalize_strings(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_normalize_strings(item) for item in value]
    if isinstance(value, str):
        text = value.strip()
        return text or None
    return value


def _is_confidence_wrapper(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and "value" in value
        and "confidence" in value
        and set(value.keys()).issubset({"value", "confidence"})
    )


def _normalize_confidence(confidence: Any, value: Any) -> float:
    if value is None:
        return 0.0

    if isinstance(confidence, (int, float)) and not isinstance(confidence, bool):
        return max(0.0, min(float(confidence), 1.0))

    return 1.0


def _coerce_leaf_value(value: Any, schema_type: str | None = None, example: Any = None) -> Any:
    if value is None:
        return None

    if schema_type == "integer":
        try:
            return int(value)
        except (TypeError, ValueError):
            return value

    if schema_type == "number":
        try:
            return float(value)
        except (TypeError, ValueError):
            return value

    if schema_type == "boolean":
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.lower()
            if lowered in {"true", "yes"}:
                return True
            if lowered in {"false", "no"}:
                return False
        return value

    if schema_type == "string":
        return str(value)

    if isinstance(example, bool):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.lower()
            if lowered in {"true", "yes"}:
                return True
            if lowered in {"false", "no"}:
                return False
        return value

    if isinstance(example, int) and not isinstance(example, bool):
        try:
            return int(value)
        except (TypeError, ValueError):
            return value

    if isinstance(example, float):
        try:
            return float(value)
        except (TypeError, ValueError):
            return value

    if isinstance(example, str):
        return str(value)

    return value


def _shape_confidence_leaf(data: Any, *, schema_type: str | None = None, example: Any = None) -> dict[str, Any]:
    if _is_confidence_wrapper(data):
        raw_value = data.get("value")
        raw_confidence = data.get("confidence")
    else:
        raw_value = data
        raw_confidence = None

    value = _coerce_leaf_value(raw_value, schema_type=schema_type, example=example)
    confidence = _normalize_confidence(raw_confidence, value)
    return {"value": value, "confidence": confidence}


def _shape_from_example(data: Any, example: Any) -> Any:
    if isinstance(example, dict):
        source = data if isinstance(data, dict) else {}
        return {key: _shape_from_example(source.get(key), schema) for key, schema in example.items()}

    if isinstance(example, list):
        item_schema = example[0] if example else None
        if not isinstance(data, list):
            return []
        if item_schema is None:
            return data
        return [_shape_from_example(item, item_schema) for item in data]

    return _shape_confidence_leaf(data, example=example)


def _shape_from_json_schema(data: Any, schema: dict[str, Any]) -> Any:
    schema_type = schema.get("type")

    if schema_type == "object":
        properties = schema.get("properties", {})
        source = data if isinstance(data, dict) else {}
        return {
            key: _shape_from_json_schema(source.get(key), child_schema)
            if isinstance(child_schema, dict)
            else source.get(key)
            for key, child_schema in properties.items()
        }

    if schema_type == "array":
        items_schema = schema.get("items", {})
        source = data if isinstance(data, list) else []
        if not isinstance(items_schema, dict):
            return source
        return [_shape_from_json_schema(item, items_schema) for item in source]

    return _shape_confidence_leaf(data, schema_type=schema_type)


def clean_and_validate_json(raw_output: str, schema: Any) -> Any:
    parsed = _normalize_strings(_parse_json(raw_output))

    if isinstance(schema, dict) and ("type" in schema or "properties" in schema):
        return _shape_from_json_schema(parsed, schema)

    return _shape_from_example(parsed, schema)
