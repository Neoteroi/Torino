from typing import List, Optional
from uuid import UUID

from azure.data.tables.aio import TableServiceClient
from dateutil.parser import parse
from domain.vfs import (
    FileImageData,
    FileSystemDataProvider,
    FileSystemNode,
    FileSystemNodePathFragment,
    FileSystemNodeType,
)
from essentials.exceptions import ObjectNotFound

from .logs import log_table_dep


def entity_to_image_data(entity: dict) -> Optional[FileImageData]:
    medium_image_name = entity.get("MediumImageName")

    if not medium_image_name:
        return None
    return FileImageData(
        medium_image_name=medium_image_name,
        small_image_name=entity.get("SmallImageName", ""),
        image_width=int(entity.get("ImageWidth", -1)),
        image_height=int(entity.get("ImageHeight", -1)),
    )


def entity_to_node(data: dict) -> FileSystemNode:
    return FileSystemNode(
        id=UUID(data["RowKey"]),
        album_id=UUID(data["AlbumId"]),
        parent_id=UUID(data["PartitionKey"]),
        node_type=FileSystemNodeType(data["NodeType"]),
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


def node_to_entity(node: FileSystemNode) -> dict:
    return {
        "PartitionKey": str(node.parent_id) if node.parent_id else str(node.album_id),
        "RowKey": str(node.id),
        "AlbumId": str(node.album_id),
        "Name": node.name,
        "Slug": node.slug,
        "Type": node.type,
        "Icon": node.icon,
        "NodeType": node.node_type.value,
        "Hidden": str(node.hidden),
        "CreationTime": node.creation_time.isoformat(),
        "LastModifiedTime": node.last_modified_time.isoformat(),
        "ETag": node.etag,
        "FileId": node.file_id,
        "FileExtension": node.file_extension,
        "FileSize": node.file_size,
        "MediumImageName": (
            node.image.medium_image_name if node.image is not None else None
        ),
        "SmallImageName": (
            node.image.small_image_name if node.image is not None else None
        ),
        "ImageWidth": node.image.image_width if node.image is not None else None,
        "ImageHeight": node.image.image_height if node.image is not None else None,
    }


class TableAPIFileSystemDataProvider(FileSystemDataProvider):
    table_name = "nodes"

    def __init__(self, table_service_client: TableServiceClient) -> None:
        super().__init__()
        self.table_client = table_service_client.get_table_client(self.table_name)

    @log_table_dep()
    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        items: List[FileSystemNode] = []
        async for entity in self.table_client.query_entities(
            f"PartitionKey eq '{album_id}'"
        ):
            items.append(entity_to_node(entity))
        return items

    @log_table_dep()
    async def get_node(
        self, node_id: UUID, include_children: bool
    ) -> Optional[FileSystemNode]:
        node: Optional[FileSystemNode] = None

        async for entity in self.table_client.query_entities(f"RowKey eq '{node_id}'"):
            node = entity_to_node(entity)

        if node is None:
            return None

        if include_children:
            node.items = await self.get_node_children(node_id)

        return node

    @log_table_dep()
    async def get_node_children(self, node_id: UUID) -> List[FileSystemNode]:
        items: List[FileSystemNode] = []
        async for entity in self.table_client.query_entities(
            f"PartitionKey eq '{node_id}'"
        ):
            items.append(entity_to_node(entity))
        return items

    @log_table_dep()
    async def get_node_path(self, node_id: UUID) -> List[FileSystemNodePathFragment]:
        items: List[FileSystemNodePathFragment] = []
        node = await self.get_node(node_id, False)

        if node is None:
            raise ObjectNotFound()

        items.append(
            FileSystemNodePathFragment(
                id=node.id,
                parent_id=node.parent_id,
                name=node.name,
            )
        )

        for _ in range(3):
            if node is None or node.parent_id is None:
                break

            node = await self.get_node(node.parent_id, False)

            if node is None:
                break

            items.append(
                FileSystemNodePathFragment(
                    id=node.id,
                    parent_id=node.parent_id,
                    name=node.name,
                )
            )

        items.reverse()
        return items

    @log_table_dep()
    async def create_nodes(self, nodes: List[FileSystemNode]) -> None:
        operations = [("create", node_to_entity(node)) for node in nodes]
        await self.table_client.submit_transaction(operations)

    @log_table_dep()
    async def update_nodes(self, nodes: List[FileSystemNode]) -> None:
        # Since nodes have Partition Key == Parent ID, which enables
        # fast reads, here we cannot simply update; we also need to
        # delete the previous nodes, if their parent id changed.
        # Therefore here we are optimizing for reads, trading off performance
        # when updating nodes. This seems reasonable because reads are done
        # more often than updates.
        # The opposite scenario would require not querying children by PK,
        # thus would cause a worse performance for reads.
        existing_nodes = [await self.get_node(node.id, False) for node in nodes]
        existing_nodes = [node for node in existing_nodes if node]
        to_delete: List[FileSystemNode] = []

        for node in nodes:
            corresponding_node = next(
                (item for item in existing_nodes if item.id == node.id), None
            )
            if corresponding_node and corresponding_node.parent_id != node.parent_id:
                to_delete.append(corresponding_node)

        operations = [("upsert", node_to_entity(node)) for node in nodes]
        await self.table_client.submit_transaction(operations)

        if to_delete:
            operations = [("delete", node_to_entity(node)) for node in to_delete]
            await self.table_client.submit_transaction(operations)

    @log_table_dep()
    async def delete_nodes(self, nodes_ids: List[UUID]) -> None:
        nodes: List[FileSystemNode] = []
        for node_id in nodes_ids:
            node = await self.get_node(node_id, False)

            if node is not None:
                nodes.append(node)

        operations = [
            ("delete", node_to_entity(node)) for node in nodes if node is not None
        ]
        await self.table_client.submit_transaction(operations)
