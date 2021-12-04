"""
This module defines how exceptions are handled by the web service.
"""
from typing import Any

from blacksheep import Request, Response
from blacksheep.server import Application
from blacksheep.server.responses import json, text
from core.errors import AcceptedExceptionWithData, ConflictError, PreconfitionFailed
from essentials.exceptions import (
    AcceptedException,
    ForbiddenException,
    InvalidArgument,
    NotImplementedException,
    ObjectNotFound,
    UnauthorizedException,
)


def configure_error_handlers(app: Application) -> None:
    async def invalid_argument_handler(
        app: Application, request: Request, exception: Exception
    ) -> Response:
        return json(
            {"error": str(exception)},
            status=400,
        )

    async def not_found_handler(
        app: Application, request: Request, exception: Exception
    ) -> Response:
        return text(str(exception) or "Not found", 404)

    async def not_implemented(*args: Any) -> Response:
        return text("Not implemented", status=500)

    async def unauthorized(*args: Any) -> Response:
        return text("Unauthorized", status=401)

    async def forbidden(*args: Any) -> Response:
        return text("Forbidden", status=403)

    async def accepted(*args: Any) -> Response:
        return text("Accepted", status=202)

    async def accepted_with_data(
        app: Application, request: Request, exc: Exception
    ) -> Response:
        assert isinstance(exc, AcceptedExceptionWithData)
        return json(exc.data)

    async def conflict(app: Application, request: Request, exc: Exception) -> Response:
        return json(
            {"error": str(exc) if app.show_error_details else "Conflict"}, status=409
        )

    async def precondition_failed(
        app: Application, request: Request, exc: Exception
    ) -> Response:
        return json(
            {"error": str(exc) if app.show_error_details else "Precondition Failed"},
            status=412,
        )

    app.exceptions_handlers.update(
        {
            ObjectNotFound: not_found_handler,
            InvalidArgument: invalid_argument_handler,
            NotImplementedException: not_implemented,
            UnauthorizedException: unauthorized,
            ForbiddenException: forbidden,
            AcceptedException: accepted,
            AcceptedExceptionWithData: accepted_with_data,
            ConflictError: conflict,
            PreconfitionFailed: precondition_failed,
        }
    )
