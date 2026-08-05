"""
Resident profile picture upload/removal.

`resident_profiles.profile_image` already existed in er-dbml.txt as a
plain varchar -- this module is what actually populates it: it validates
an uploaded image, saves it under settings.MEDIA_ROOT, and stores the
public URL (settings.MEDIA_URL + path) on the row. main.py mounts
MEDIA_ROOT as static files at MEDIA_URL so the stored value is directly
usable by a frontend <img src>.

This is now the ONLY way profile_image gets set -- see
app/schemas/auth_schema.py's ResidentProfileIn, which used to also
accept a free-text profile_image at signup, bypassing all of the
validation below.

Security notes:
- The client-supplied filename is never used for anything (no path
  traversal surface) -- we generate our own name from user_id + a random
  suffix and an extension we derived ourselves.
- The declared Content-Type header is a hint, not proof, so we also sniff
  the first few bytes against known JPEG/PNG/WEBP signatures and reject a
  mismatch. No new dependency needed for this (no python-magic) -- these
  three formats have simple, well-known magic bytes.
- Upload size is enforced by reading in bounded chunks and bailing out
  the moment the cap is exceeded, rather than reading the whole body into
  memory first and checking after.
"""
import os
import uuid

from fastapi import UploadFile

from app.core.config import settings
from app.models.apartment import ResidentProfile
from app.utils.api_error import BadRequest

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB

# content-type -> extension, for the formats we accept.
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def _sniff_image_content_type(header: bytes) -> str | None:
    """Identify JPEG/PNG/WEBP from magic bytes, independent of whatever
    Content-Type the client claimed."""
    if header[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    return None


def _read_upload_bounded(file: UploadFile, max_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = file.file.read(CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise BadRequest(f"Image must be smaller than {max_bytes // (1024 * 1024)} MB.")
        chunks.append(chunk)
    return b"".join(chunks)


def _profile_picture_dir() -> str:
    path = os.path.join(settings.MEDIA_ROOT, "profile_pictures")
    os.makedirs(path, exist_ok=True)
    return path


def _delete_stored_file(profile_image: str | None) -> None:
    """Best-effort delete of a previously-stored file. No-ops silently on
    anything we don't recognize as ours (e.g. an externally hosted URL) or
    that's already gone -- this is cleanup, not a step that should ever
    fail the request."""
    if not profile_image or not profile_image.startswith(settings.MEDIA_URL):
        return
    relative_path = profile_image[len(settings.MEDIA_URL):].lstrip("/")
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    if os.path.isfile(full_path):
        try:
            os.remove(full_path)
        except OSError:
            pass  # filesystem race (e.g. already deleted) -- not fatal


def upload_profile_picture(db, resident_profile: ResidentProfile, file: UploadFile) -> ResidentProfile:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise BadRequest("Only JPEG, PNG, or WEBP images are allowed.")

    contents = _read_upload_bounded(file, MAX_UPLOAD_BYTES)
    if not contents:
        raise BadRequest("Uploaded file is empty.")

    sniffed_type = _sniff_image_content_type(contents[:12])
    if sniffed_type is None or sniffed_type != file.content_type:
        raise BadRequest("The uploaded file doesn't look like a valid JPEG, PNG, or WEBP image.")

    extension = ALLOWED_CONTENT_TYPES[sniffed_type]
    filename = f"{resident_profile.user_id}_{uuid.uuid4().hex}.{extension}"
    full_path = os.path.join(_profile_picture_dir(), filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    # Only remove the old file once the new one is safely written.
    _delete_stored_file(resident_profile.profile_image)

    resident_profile.profile_image = f"{settings.MEDIA_URL}/profile_pictures/{filename}"
    db.commit()
    db.refresh(resident_profile)
    return resident_profile


def delete_profile_picture(db, resident_profile: ResidentProfile) -> ResidentProfile:
    _delete_stored_file(resident_profile.profile_image)
    resident_profile.profile_image = None
    db.commit()
    db.refresh(resident_profile)
    return resident_profile