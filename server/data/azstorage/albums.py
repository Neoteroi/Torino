from azure.core.exceptions import (
    ResourceNotFoundError,
)
from typing import Optional, List
from uuid import UUID
from domain.albums import Album, AlbumsDataProvider
from azure.data.tables.aio import TableServiceClient


def album_to_entity(album: Album) -> dict:
    # TODO: PartitionKey == storage_id?
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
    )


class TableAPIAlbumsDataProvider(AlbumsDataProvider):
    table_name = "albums"

    def __init__(self, table_service_client: TableServiceClient) -> None:
        super().__init__()
        self.table_client = table_service_client.get_table_client(self.table_name)

    async def get_album(self, album_id: UUID) -> Optional[Album]:
        async with self.table_client:
            key = str(album_id)
            try:
                entity = await self.table_client.get_entity(
                    partition_key=key, row_key=key
                )
                return entity_to_album(entity)
            except ResourceNotFoundError:
                return None

    async def get_albums(self) -> List[Album]:
        results: List[Album] = []
        async with self.table_client:
            async for entity in self.table_client.list_entities():
                results.append(entity_to_album(entity))
        return results

    async def create_album(self, data: Album) -> None:
        # TODO: we should insert more than one entity here,
        # to support indexing by storage_id, slug
        async with self.table_client:
            await self.table_client.create_entity(entity=album_to_entity(data))

    async def update_album(self, data: Album) -> None:
        async with self.table_client:
            await self.table_client.update_entity(entity=album_to_entity(data))
