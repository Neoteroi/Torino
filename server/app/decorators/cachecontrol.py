import inspect
from functools import wraps
from typing import Any, Callable

from blacksheep.server.normalization import ensure_response


def cache_control(max_age: int) -> Callable[..., Any]:
    def decorator(next_handler):

        if inspect.iscoroutinefunction(next_handler):

            @wraps(next_handler)
            async def async_wrapped(*args, **kwargs):
                response = ensure_response(await next_handler(*args, **kwargs))

                response.add_header(b"cache-control", f"max-age={max_age}".encode())

                return response

            return async_wrapped
        else:

            @wraps(next_handler)
            def wrapped(*args, **kwargs):
                response = ensure_response(next_handler(*args, **kwargs))

                response.add_header(b"cache-control", f"max-age={max_age}".encode())

                return response

            return wrapped

    return decorator
