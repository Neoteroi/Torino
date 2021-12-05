from typing import Awaitable, Callable

from blacksheep.messages import Request, Response
from rodi import GetServiceContext


async def dependency_injection_middleware(
    request: Request, handler: Callable[[Request], Awaitable[Response]]
) -> Response:
    # assign a resolution context to the request,
    # this enables obtaining the current request by dependency injection into
    # factories and classes that need it, without polluting all the code and having
    # to pass the request object down to all function calls
    with GetServiceContext(scoped_services={Request: request}) as context:
        request.services_context = context  # type: ignore
        return await handler(request)
