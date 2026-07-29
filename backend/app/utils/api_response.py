"""
Renamed from envelope.py. Standard success-response shape:

    { "success": true, "data": ..., "message": "" }

Routers call success_response() explicitly for every 2xx response.
Error responses are NOT built here -- they're handled by
app.utils.api_error (AppError) and the global exception handlers in
main.py, which produce { "success": false, "message": "..." }. Routers
never construct error bodies themselves; they just raise an AppError
subclass and move on.
"""
from typing import Any


def success_response(data: Any = None, message: str = "") -> dict:
    return {"success": True, "data": data, "message": message}
