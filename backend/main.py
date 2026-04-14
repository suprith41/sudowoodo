import json
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pipeline.extractor import extract_with_groq
from pipeline.ingestion import prepare_document_payload
from pipeline.validator import clean_and_validate_json


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(
    title="Sudowoodo",
    description="Document to JSON extraction pipeline powered by Groq.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract")
async def extract_document(
    file: UploadFile = File(...),
    extraction_schema: str = Form(..., alias="schema"),
) -> dict[str, object]:
    try:
        schema_payload = json.loads(extraction_schema)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Schema must be valid JSON.") from exc

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        document_payload = prepare_document_payload(
            filename=file.filename or "upload",
            content_type=file.content_type,
            file_bytes=file_bytes,
        )
        raw_output = extract_with_groq(document_payload=document_payload, schema=schema_payload)
        cleaned_output = clean_and_validate_json(raw_output=raw_output, schema=schema_payload)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Extraction failed.") from exc

    return {"data": cleaned_output}
