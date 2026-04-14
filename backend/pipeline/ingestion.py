import base64
from pathlib import Path

import fitz
from fastapi import HTTPException


SUPPORTED_IMAGE_TYPES = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
}

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg": "jpeg",
    ".jpeg": "jpeg",
    ".png": "png",
    ".webp": "webp",
}


def _to_base64(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")


def _pdf_to_images(file_bytes: bytes) -> list[dict[str, object]]:
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail="The PDF file could not be read.") from exc

    pages: list[dict[str, object]] = []
    try:
        for index, page in enumerate(document):
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image_bytes = pixmap.tobytes("png")
            pages.append(
                {
                    "page_number": index + 1,
                    "mime_type": "image/png",
                    "base64_data": _to_base64(image_bytes),
                }
            )
    finally:
        document.close()

    if not pages:
        raise HTTPException(status_code=400, detail="The PDF file has no pages to extract.")

    return pages


def _single_image_payload(filename: str, image_format: str, file_bytes: bytes) -> dict[str, object]:
    return {
        "kind": "image",
        "filename": filename,
        "pages": [
            {
                "page_number": 1,
                "mime_type": f"image/{image_format}",
                "base64_data": _to_base64(file_bytes),
            }
        ],
    }


def prepare_document_payload(
    filename: str,
    content_type: str | None,
    file_bytes: bytes,
) -> dict[str, object]:
    extension = Path(filename).suffix.lower()

    if content_type == "application/pdf" or extension == ".pdf":
        return {
            "kind": "pdf",
            "filename": filename,
            "pages": _pdf_to_images(file_bytes),
        }

    image_format = SUPPORTED_IMAGE_TYPES.get(content_type or "")
    if not image_format:
        image_format = SUPPORTED_IMAGE_EXTENSIONS.get(extension)

    if image_format:
        return _single_image_payload(
            filename=filename,
            image_format=image_format,
            file_bytes=file_bytes,
        )

    raise HTTPException(
        status_code=400,
        detail="Only PDF, PNG, JPG, JPEG, and WEBP files are supported.",
    )
