import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import registry, relationship  # type: ignore
from sqlalchemy.sql import expression
from sqlalchemy.types import DateTime

# from sqlalchemy.dialects.postgresql import UUID
from data.sql.uuid import UUID

mapper_registry = registry()
metadata = mapper_registry.metadata

Base = mapper_registry.generate_base()


# Note: unique indexes are defined manually in migrations to make them case insensitive
# Use `alembic revision --autogenerate -m "description"` to create a new migration


# region mixins


class UTCNow(expression.FunctionElement):
    type = DateTime()  # type: ignore


@compiles(UTCNow, "postgresql")
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


@compiles(UTCNow, "sqlite")
def sqlite_utcnow(element, compiler, **kw):
    return "CURRENT_TIMESTAMP"


# https://docs.sqlalchemy.org/en/14/core/defaults.html#python-executed-functions
class ETagMixin:
    created_at = Column(DateTime, server_default=UTCNow(), nullable=False)
    updated_at = Column(DateTime, server_default=UTCNow(), nullable=False)
    etag = Column(String(50), server_default=UTCNow(), nullable=False)


ETagMixin.created_at._creation_order = 9000  # type: ignore
ETagMixin.updated_at._creation_order = 9001  # type: ignore
ETagMixin.etag._creation_order = 9002  # type: ignore


# endregion


class StorageEntity(ETagMixin, Base):
    __tablename__ = "storages"

    id = Column("id", UUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True)
    type = Column(String(50))
    key_secret_id = Column(String(200), nullable=False)


class AlbumEntity(ETagMixin, Base):
    __tablename__ = "albums"

    id = Column("id", UUID(), primary_key=True, default=uuid.uuid4)
    storage_id = Column(
        ForeignKey("storages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(200), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    public = Column(Boolean, nullable=False, default=False)
    image_url = Column(String(2000), nullable=True)


# See:
# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
class NodeEntity(ETagMixin, Base):
    __tablename__ = "nodes"

    id = Column("id", UUID(), primary_key=True, default=uuid.uuid4)
    album_id = Column(
        ForeignKey("albums.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id = Column(
        ForeignKey("nodes.id", ondelete="CASCADE"), nullable=True, index=True
    )
    children = relationship("NodeEntity")
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    icon = Column(String(255), nullable=True)
    hidden = Column(Boolean, nullable=False, default=False)
    folder = Column(Boolean, nullable=False, default=False)
    file_id = Column(String(255), nullable=True)
    file_extension = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)
    medium_image_name = Column(String(255), nullable=True)
    small_image_name = Column(String(255), nullable=True)
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
