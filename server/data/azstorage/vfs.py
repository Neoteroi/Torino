from dateutil.parser import parse
from typing import List, Optional
from uuid import UUID

from azure.data.tables.aio import TableServiceClient

from domain.vfs import (
    FileImageData,
    FileSystemDataProvider,
    FileSystemNode,
    FileSystemNodePathFragment,
    FileSystemNodeType,
)


def entity_to_image_data(entity: dict) -> Optional[FileImageData]:
    medium_image_name = entity["MediumImageName"]

    if not medium_image_name:
        return None
    return FileImageData(
        medium_image_name=medium_image_name,
        small_image_name=entity["SmallImageName"],
        image_width=int(entity["ImageWidth"]),
        image_height=int(entity["ImageHeight"]),
    )


def entity_to_node(data: dict) -> FileSystemNode:
    return FileSystemNode(
        id=UUID(data["RowKey"]),
        album_id=UUID(data["AlbumId"]),
        parent_id=UUID(data["PartitionKey"]),
        node_type=FileSystemNodeType.FILE,
        name=data["Name"],
        slug=data["Slug"],
        type=data["Type"],
        file_id=data["FileId"] if "FileId" in data else None,
        file_extension=data["FileExtension"] if "FileExtension" in data else None,
        file_size=int(data["FileSize"]) if "FileSize" in data else None,
        icon=data["Icon"] if "Icon" in data else None,
        etag=data["ETag"],
        last_modified_time=parse(data["LastModifiedTime"]),
        creation_time=parse(data["CreationTime"]),
        hidden=bool(data["Hidden"]),
        items=[],
        image=entity_to_image_data(data),
    )


class TableAPIFileSystemDataProvider(FileSystemDataProvider):
    table_name = "nodes"

    def __init__(self, table_client: TableServiceClient) -> None:
        super().__init__()
        self.table_client = table_client

    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        results: List[FileSystemNode] = []
        async with self.table_client:
            async for entity in self.table.query_entities(
                f"PartitionKey eq '{album_id}'"
            ):
                results.append(entity_to_node(entity))
        return results

    async def get_node(
        self, node_id: UUID, include_children: bool
    ) -> Optional[FileSystemNode]:
        raise NotImplementedError()

    async def get_node_children(self, node_id: UUID) -> List[FileSystemNode]:
        raise NotImplementedError()

    async def get_node_path(self, node_id: UUID) -> List[FileSystemNodePathFragment]:
        raise NotImplementedError()

    async def create_nodes(self, nodes: List[FileSystemNode]) -> None:
        raise NotImplementedError()

    async def update_nodes(self, nodes: List[FileSystemNode]) -> None:
        raise NotImplementedError()

    async def delete_nodes(self, nodes: List[UUID]) -> None:
        raise NotImplementedError()
