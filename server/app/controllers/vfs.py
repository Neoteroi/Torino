from typing import List
from uuid import UUID

from blacksheep import Response
from blacksheep.server.bindings import FromJSON
from blacksheep.server.controllers import ApiController, delete, get, patch, post

from domain.vfs import (
    CopyOperationInput,
    CreateNodeInput,
    FileSystemHandler,
    FileSystemNode,
    FileSystemNodePathFragment,
    UpdateNodeInput,
)


class VirtualFileSystemController(ApiController):
    def __init__(self, manager: FileSystemHandler) -> None:
        super().__init__()

        self.manager = manager

    @classmethod
    def class_name(cls) -> str:
        return "nodes"

    @get("/:node_id")
    async def get_node(self, node_id: UUID) -> FileSystemNode:
        """
        Gets a single node.
        """
        return await self.manager.get_node(node_id)

    @patch("/:node_id")
    async def update_node(
        self, node_id: UUID, data: FromJSON[UpdateNodeInput]
    ) -> FileSystemNode:
        """
        Updates a single node by id.
        """
        return await self.manager.update_node(node_id, data.value)

    @patch()
    async def update_nodes(self, data: FromJSON[List[UpdateNodeInput]]) -> Response:
        """
        Updates one or more nodes.
        """
        if not data.value:
            return self.no_content()
        return self.json(await self.manager.update_nodes(data.value))

    @delete()
    async def delete_nodes(self, node_ids: FromJSON[List[UUID]]) -> Response:
        """
        Deletes one ore more nodes by id.
        """
        if not node_ids:
            return self.bad_request()
        await self.manager.delete_nodes(node_ids.value)
        return self.no_content()

    @get("/:node_id/nodes")
    async def get_node_children(
        self,
        node_id: UUID,
    ) -> List[FileSystemNode]:
        """
        Gets the children of a given node, by its id.
        """
        return await self.manager.get_node_children(node_id)

    @get("/:node_id/path")
    async def get_node_path(
        self,
        node_id: UUID,
    ) -> List[FileSystemNodePathFragment]:
        """
        Gets the path of a single node, or a path fragment.
        """
        return await self.manager.get_node_path(node_id)

    @post()
    async def create_nodes(self, data: List[CreateNodeInput]) -> List[FileSystemNode]:
        """
        Creates one or more nodes.
        """
        return await self.manager.create_nodes(data)

    @post("/move")
    async def move_nodes(self, data: CopyOperationInput) -> List[FileSystemNode]:
        """
        Moves one or more nodes to a new parent.
        """
        return await self.manager.move_nodes(data)

    @post("/paste")
    async def paste_nodes(self, data: CopyOperationInput) -> List[FileSystemNode]:
        """
        Clones one or more nodes from a parent to a new parent.
        """
        return await self.manager.paste_nodes(data)
