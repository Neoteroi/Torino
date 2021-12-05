from typing import List, Optional
from uuid import UUID

from domain.vfs import (
    FileImageData,
    FileSystemDataProvider,
    FileSystemNode,
    FileSystemNodePathFragment,
    FileSystemNodeType,
)
from essentials.exceptions import ObjectNotFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from sqlalchemy.sql.expression import select, delete

from .dbmodel import NodeEntity
from .mapping import map_optional_uuid


def entity_to_image_data(entity: NodeEntity) -> Optional[FileImageData]:
    medium_image_name = entity.medium_image_name

    if not medium_image_name:
        return None
    return FileImageData(
        medium_image_name=medium_image_name,
        small_image_name=entity.small_image_name,
        image_width=entity.image_width,
        image_height=entity.image_height,
    )


def node_entity_to_node(entity: NodeEntity) -> FileSystemNode:
    return FileSystemNode(
        id=UUID(entity.id),
        album_id=UUID(entity.album_id),
        parent_id=map_optional_uuid(entity.parent_id),
        name=entity.name,
        slug=entity.slug,
        hidden=entity.hidden,
        creation_time=entity.created_at,
        last_modified_time=entity.updated_at,
        file_id=entity.file_id,
        file_extension=entity.file_extension,
        file_size=entity.file_size,
        node_type=FileSystemNodeType.FOLDER
        if entity.folder
        else FileSystemNodeType.FILE,
        type=entity.type,
        icon=entity.icon,
        etag=entity.etag,
        items=[],
        image=entity_to_image_data(entity),
    )


def node_to_node_entity(node: FileSystemNode) -> NodeEntity:
    return NodeEntity(
        id=str(node.id),
        album_id=str(node.album_id),
        parent_id=str(node.parent_id) if node.parent_id else None,
        name=node.name,
        slug=node.slug,
        type=node.type,
        icon=node.icon,
        hidden=node.hidden,
        folder=node.node_type == FileSystemNodeType.FOLDER,
        file_id=node.file_id,
        file_extension=node.file_extension,
        file_size=node.file_size,
        medium_image_name=(
            node.image.medium_image_name if node.image is not None else None
        ),
        small_image_name=(
            node.image.small_image_name if node.image is not None else None
        ),
        image_width=node.image.image_width if node.image is not None else None,
        image_height=node.image.image_height if node.image is not None else None,
    )


class SQLFileSystemDataProvider(FileSystemDataProvider):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__()
        self.session = session

    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        async with self.session:
            results = await self.session.execute(
                select(NodeEntity)
                .where(
                    (NodeEntity.album_id == str(album_id))
                    & (NodeEntity.parent_id == None)
                )
                .order_by(NodeEntity.name)  # type: ignore
            )
            return [node_entity_to_node(record) for record in results.scalars()]

    async def _get_node_children(self, node_id: UUID) -> List[FileSystemNode]:
        results = await self.session.execute(
            select(NodeEntity)
            .where(NodeEntity.parent_id == str(node_id))
            .order_by(NodeEntity.name)  # type: ignore
        )
        return [node_entity_to_node(record) for record in results.scalars()]

    async def get_node(
        self, node_id: UUID, include_children: bool
    ) -> Optional[FileSystemNode]:
        async with self.session:
            record = await self.session.get(NodeEntity, str(node_id))

            if not record:
                return None

            node = node_entity_to_node(record)

            if include_children:
                node.items = await self._get_node_children(node_id)

            return node

    async def get_node_children(self, node_id: UUID) -> List[FileSystemNode]:
        async with self.session:
            return await self._get_node_children(node_id)

    async def get_node_path(self, node_id: UUID) -> List[FileSystemNodePathFragment]:
        items: List[FileSystemNodePathFragment] = []

        async with self.session:
            query = text(
                """
                SELECT
                    A.name as a_name,
                    A.id as a_id,
                    A.parent_id as a_parent_id,
                    B.name as b_name,
                    B.id as b_id,
                    B.parent_id as b_parent_id,
                    C.name as c_name,
                    C.id as c_id,
                    C.parent_id as c_parent_id,
                    D.name as d_name,
                    D.id as d_id,
                    D.parent_id as d_parent_id
                FROM nodes A
                LEFT OUTER JOIN nodes B on A.parent_id = B.id
                LEFT OUTER JOIN nodes C on B.parent_id = C.id
                LEFT OUTER JOIN nodes D on C.parent_id = D.id
                WHERE A.id = :id;
                """
            )
            cursor = await self.session.execute(query, {"id": str(node_id)})  # type: ignore

            record = next(cursor, None)

            if record is None:
                raise ObjectNotFound()

            if record["d_id"] is not None:
                items.append(
                    FileSystemNodePathFragment(
                        id=record["d_id"],
                        parent_id=record["d_parent_id"],
                        name=record["d_name"],
                    )
                )
            if record["c_id"] is not None:
                items.append(
                    FileSystemNodePathFragment(
                        id=record["c_id"],
                        parent_id=record["c_parent_id"],
                        name=record["c_name"],
                    )
                )
            if record["b_id"] is not None:
                items.append(
                    FileSystemNodePathFragment(
                        id=record["b_id"],
                        parent_id=record["b_parent_id"],
                        name=record["b_name"],
                    )
                )
            if record["a_id"] is not None:
                items.append(
                    FileSystemNodePathFragment(
                        id=record["a_id"],
                        parent_id=record["a_parent_id"],
                        name=record["a_name"],
                    )
                )

        return items

    async def create_nodes(self, nodes: List[FileSystemNode]) -> None:
        async with self.session:
            self.session.add_all([node_to_node_entity(node) for node in nodes])  # type: ignore
            await self.session.commit()

    async def update_nodes(self, nodes: List[FileSystemNode]) -> None:
        async with self.session:
            for node in nodes:
                await self.session.merge(node_to_node_entity(node))

            await self.session.commit()

    async def delete_nodes(self, nodes: List[UUID]) -> None:
        async with self.session:
            for node_id in nodes:
                await self.session.execute(
                    delete(NodeEntity).where(
                        NodeEntity.id == str(node_id)
                    )  # type: ignore
                )

            await self.session.commit()
