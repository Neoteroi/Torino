from typing import Optional, Union
from uuid import UUID

UUIDType = Union[UUID, str]


def get_uuid(value: UUIDType) -> UUID:
    if isinstance(value, UUID):
        return value
    return UUID(value)


def map_optional_uuid(value: Optional[UUIDType]) -> Optional[UUID]:
    return get_uuid(value) if value else None
