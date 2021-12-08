from blacksheep.messages import Request, Response


def _get_hsts_value(max_age: int, include_subdomains: bool) -> bytes:
    value = f"max-age={max_age};"

    if include_subdomains:
        value = value + " includeSubDomains;"

    return value.encode()


class HSTSMiddleware:
    """
    Middleware configuring "Strict-Transport-Security" header on responses.
    By default, it uses "max-age=31536000; includeSubDomains;".
    """

    def __init__(
        self,
        max_age: int = 31536000,
        include_subdomains: bool = True,
    ) -> None:
        self._max_age = max_age
        self._include_subdomains = include_subdomains
        self._value = _get_hsts_value(max_age, include_subdomains)

    async def __call__(self, request: Request, handler):
        response: Response = await handler(request)
        response.headers.add(b"Strict-Transport-Security", f"".encode())
        return response
