from typing import Optional
from uuid import UUID


def map_optional_uuid(value: Optional[str]) -> Optional[UUID]:
    return UUID(value) if value else None
