from azure.core.exceptions import (
    ResourceNotFoundError,
)
from typing import Optional, List
from uuid import UUID
from domain.albums import Album, AlbumsDataProvider
from azure.data.tables.aio import TableServiceClient
from .logs import log_table_dep


def album_to_entity(album: Album) -> dict:
    return {
        "PartitionKey": str(album.id),
        "RowKey": str(album.id),
        "StorageId": str(album.storage_id),
        "Name": album.name,
        "Slug": album.slug,
        "ImageURL": album.image_url,
        "Description": album.description,
        "LastModifiedTime": album.last_modified_time,
        "CreationTime": album.creation_time,
        "ETag": album.etag,
        "Public": album.public,
    }


def entity_to_album(data: dict) -> Album:
    return Album(
        id=UUID(data["RowKey"]),
        storage_id=UUID(data["StorageId"]),
        slug=data["Slug"],
        image_url=data["ImageURL"],
        name=data["Name"],
        description=data["Description"],
        last_modified_time=data["LastModifiedTime"],
        creation_time=data["CreationTime"],
        etag=data["ETag"],
        public=data["Public"],
        items=[],
    )


class TableAPIAlbumsDataProvider(AlbumsDataProvider):
    table_name = "albums"

    def __init__(self, table_service_client: TableServiceClient) -> None:
        super().__init__()
        self.table_client = table_service_client.get_table_client(self.table_name)

    @log_table_dep()
    async def get_album(self, album_id: UUID) -> Optional[Album]:
        key = str(album_id)
        try:
            entity = await self.table_client.get_entity(partition_key=key, row_key=key)
            return entity_to_album(entity)
        except ResourceNotFoundError:
            return None

    @log_table_dep()
    async def get_albums(self) -> List[Album]:
        results: List[Album] = []
        async for entity in self.table_client.list_entities():
            results.append(entity_to_album(entity))
        return results

    @log_table_dep()
    async def create_album(self, data: Album) -> None:
        # TODO: we should insert more than one entity here,
        # to support indexing by storage_id, slug
        await self.table_client.create_entity(entity=album_to_entity(data))

    @log_table_dep()
    async def update_album(self, data: Album) -> None:
        await self.table_client.update_entity(entity=album_to_entity(data))
