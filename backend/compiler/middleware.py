import time
import json
import logging
from functools import wraps
from flask import request, jsonify, current_app


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        return json.dumps(log_entry)


def setup_logging(app):
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    app.logger.handlers = []
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)


class RateLimiter:
    def __init__(self, requests_per_minute=60):
        self._requests_per_minute = requests_per_minute
        self._clients = {}

    def _cleanup(self):
        now = time.time()
        cutoff = now - 60
        expired = [k for k, v in self._clients.items() if v[-1] < cutoff]
        for k in expired:
            del self._clients[k]

    def is_allowed(self, key):
        self._cleanup()
        now = time.time()
        if key not in self._clients:
            self._clients[key] = []
        timestamps = self._clients[key]
        timestamps[:] = [t for t in timestamps if t > now - 60]
        if len(timestamps) >= self._requests_per_minute:
            return False
        timestamps.append(now)
        return True


_GLOBAL_LIMITER = RateLimiter(requests_per_minute=60)


def rate_limit(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        client_ip = request.remote_addr or "unknown"
        if not _GLOBAL_LIMITER.is_allowed(client_ip):
            app = current_app._get_current_object()
            app.logger.warning("Rate limit exceeded", extra={"request_id": id(request)})
            return jsonify({
                "success": False,
                "error": "Rate limit exceeded. Try again later."
            }), 429
        return f(*args, **kwargs)
    return wrapper


def validate_input(payload):
    errors = []
    for key in ("logic",):
        value = payload.get(key)
        if value is not None:
            if not isinstance(value, str):
                errors.append(f"'{key}' must be a string")
            elif len(value) > 10000:
                errors.append(f"'{key}' exceeds 10000 character limit")
    for key in ("nodes", "edges", "parts"):
        value = payload.get(key)
        if value is not None:
            if not isinstance(value, list):
                errors.append(f"'{key}' must be an array")
            elif len(value) > 500:
                errors.append(f"'{key}' exceeds 500 item limit")
    return errors
