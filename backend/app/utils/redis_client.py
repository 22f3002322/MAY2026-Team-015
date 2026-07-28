"""
Redis client singleton. Used only for short-lived password-reset tokens
now (see app/services/auth_service.py) -- refresh tokens moved to
Postgres, see app/models/refresh_token.py.
"""
import redis

from app.core.config import settings

_client: redis.Redis | None = None


def get_redis_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _client
