from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import select

from domain.albums import Album, AlbumsDataProvider

from .dbmodel import AlbumEntity


def album_entity_to_album(entity: AlbumEntity) -> Album:
    return Album(
        id=UUID(entity.id),
        storage_id=entity.storage_id,
        name=entity.name,
        slug=entity.slug,
        description=entity.description,
        creation_time=entity.created_at,
        image_url=entity.image_url,
        last_modified_time=entity.updated_at,
        etag=entity.etag,
        items=[],
        public=entity.public,
    )


def album_to_album_entity(album: Album) -> AlbumEntity:
    return AlbumEntity(
        id=str(album.id),
        storage_id=str(album.storage_id),
        name=album.name,
        slug=album.slug,
        image_url=album.image_url,
        description=album.description,
        created_at=album.creation_time,
        updated_at=album.last_modified_time,
        etag=album.etag,
        public=album.public,
    )


class SQLAlbumsDataProvider(AlbumsDataProvider):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__()
        self.session = session

    async def get_album(self, album_id: UUID) -> Optional[Album]:
        # TODO: support by slug or by UUID!! - meaning that album_id must be a string!
        async with self.session:
            record = await self.session.get(AlbumEntity, str(album_id))
            return album_entity_to_album(record) if record else None

    async def get_albums(self) -> List[Album]:
        async with self.session:
            results = await self.session.execute(
                select(AlbumEntity).order_by(AlbumEntity.name)  # type: ignore
            )
            return [album_entity_to_album(record) for record in results.scalars()]

    async def create_album(self, data: Album) -> None:
        async with self.session:
            self.session.add(album_to_album_entity(data))  # type: ignore
            await self.session.commit()

    async def update_album(self, data: Album) -> None:
        async with self.session:
            await self.session.merge(album_to_album_entity(data))
            await self.session.commit()
