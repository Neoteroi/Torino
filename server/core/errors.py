from typing import Any

from essentials.exceptions import AcceptedException


class ConflictError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)


class PreconfitionFailed(Exception):
    def __init__(
        self,
        message: str = "The resource has been modified since it was read.",
    ) -> None:
        super().__init__(message)


class AcceptedExceptionWithData(AcceptedException):
    def __init__(self, message: str = "Accepted", data: Any = None):
        super().__init__(message=message)
        self.data = data
