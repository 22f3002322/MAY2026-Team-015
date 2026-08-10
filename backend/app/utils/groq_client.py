"""
Groq OpenAI-compatible chat client for Module 1.10.

Peer of redis_client / security / otp -- thin infra helper used by
ai_service. Never import this from routers directly.
"""
from __future__ import annotations

import json
import logging
import re
import time
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.utils.api_error import ServiceUnavailable

logger = logging.getLogger("neighbourly.ai")

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


def ensure_ai_enabled() -> None:
    if not settings.AI_ENABLED:
        raise ServiceUnavailable(
            "AI Community Intelligence is disabled. Set AI_ENABLED=true and configure GROQ_API_KEY."
        )
    if not (settings.GROQ_API_KEY or "").strip():
        raise ServiceUnavailable("GROQ_API_KEY is not configured.")


def chat_completion(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 1024,
    response_json: bool = False,
) -> tuple[str, int]:
    """
    Call Groq chat completions. Returns (content, latency_ms).
    Retries once on HTTP 429.
    """
    ensure_ai_enabled()

    url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body: dict[str, Any] = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_json:
        body["response_format"] = {"type": "json_object"}

    last_error: Optional[Exception] = None
    for attempt in range(2):
        started = time.perf_counter()
        try:
            with httpx.Client(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
                response = client.post(url, headers=headers, json=body)
            latency_ms = int((time.perf_counter() - started) * 1000)

            if response.status_code == 429 and attempt == 0:
                time.sleep(1.0)
                continue

            if response.status_code >= 400:
                logger.warning(
                    "Groq error status=%s body=%s",
                    response.status_code,
                    (response.text or "")[:300],
                )
                raise ServiceUnavailable("AI provider returned an error. Please try again shortly.")

            data = response.json()
            choices = data.get("choices") or []
            if not choices:
                raise ServiceUnavailable("AI provider returned an empty response.")
            content = (choices[0].get("message") or {}).get("content") or ""
            return content.strip(), latency_ms
        except ServiceUnavailable:
            raise
        except httpx.TimeoutException as exc:
            last_error = exc
            logger.warning("Groq timeout: %s", exc)
            raise ServiceUnavailable("AI provider timed out. Please try again.") from exc
        except Exception as exc:
            last_error = exc
            logger.warning("Groq request failed: %s", exc)
            if attempt == 0:
                continue
            raise ServiceUnavailable("AI provider is unreachable. Please try again.") from exc

    raise ServiceUnavailable("AI provider is unreachable. Please try again.") from last_error


def parse_json_content(content: str) -> dict[str, Any]:
    """Parse model JSON, tolerating optional markdown fences."""
    text = (content or "").strip()
    if not text:
        raise ServiceUnavailable("AI returned empty JSON.")

    match = _JSON_FENCE_RE.search(text)
    if match:
        text = match.group(1).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        # Best-effort: first {...} block
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            try:
                parsed = json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                raise ServiceUnavailable("AI returned malformed JSON.") from exc
        else:
            raise ServiceUnavailable("AI returned malformed JSON.") from exc

    if not isinstance(parsed, dict):
        raise ServiceUnavailable("AI returned unexpected JSON shape.")
    return parsed
