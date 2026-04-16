import base64
from pathlib import Path

import fitz
from fastapi import HTTPException


PDF_RENDER_DPI = 150
MAX_PDF_PAGES = 10
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


def _pdf_to_images(file_bytes: bytes) -> tuple[list[dict[str, object]], str | None]:
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail="The PDF file could not be read.") from exc

    scale = PDF_RENDER_DPI / 72
    pages: list[dict[str, object]] = []
    total_pages = 0
    try:
        for index, page in enumerate(document):
            total_pages += 1
            if index >= MAX_PDF_PAGES:
                continue

            pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
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

    warning = None
    if total_pages > MAX_PDF_PAGES:
        warning = (
            f"Only the first {MAX_PDF_PAGES} pages were processed from this "
            f"{total_pages}-page PDF."
        )

    return pages, warning


def _single_image_payload(filename: str, image_format: str, file_bytes: bytes) -> dict[str, object]:
    return {
        "kind": "image",
        "filename": filename,
        "pages_processed": 1,
        "warning": None,
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
        pages, warning = _pdf_to_images(file_bytes)
        return {
            "kind": "pdf",
            "filename": filename,
            "pages_processed": len(pages),
            "warning": warning,
            "pages": pages,
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
