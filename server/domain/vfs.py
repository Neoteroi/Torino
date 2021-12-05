from abc import ABC
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from slugify import slugify

from core.errors import AcceptedExceptionWithData, PreconfitionFailed
from core.pathutils import DEFAULT_MIME, get_file_extension_from_name
from essentials.exceptions import InvalidArgument, ObjectNotFound
from pydantic import BaseModel

from domain.logs import ailog
from domain.pictures import PicturesHandler


class FileSystemNodeType(Enum):
    FILE = "file"
    FOLDER = "folder"


@dataclass
class FileImageData:
    """Additional information for image file"""

    medium_image_name: str
    small_image_name: str
    image_width: int
    image_height: int


@dataclass
class FileSystemNode:
    id: UUID
    album_id: UUID
    parent_id: Optional[UUID]
    node_type: FileSystemNodeType
    name: str
    slug: str
    type: str
    file_id: Optional[str]
    file_extension: Optional[str]
    file_size: Optional[int]
    icon: Optional[str]
    etag: str
    last_modified_time: datetime
    creation_time: datetime
    hidden: bool
    items: Optional[List["FileSystemNode"]]
    image: Optional[FileImageData] = None


@dataclass
class FileSystemNodePathFragment:
    id: UUID
    parent_id: UUID
    name: str


class CreateNodeInput(BaseModel):
    name: str
    album_id: UUID
    parent_id: Optional[UUID]
    file_id: Optional[str] = None
    file_size: Optional[int] = None
    file_mime: Optional[str] = None
    node_type: Optional[FileSystemNodeType] = FileSystemNodeType.FOLDER


class UpdateNodeInput(BaseModel):
    id: UUID
    name: str
    etag: Optional[str]
    parent_id: Optional[UUID]


class CopyOperationInput(BaseModel):
    album_id: UUID
    source_parent_id: Optional[UUID]
    target_parent_id: Optional[UUID]
    nodes: List[UpdateNodeInput]


class FileSystemDataProvider(ABC):
    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        raise NotImplementedError()

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


handled_pictures = {"image/jpeg", "image/pjpeg", "image/png"}


class FileSystemHandler:
    def __init__(
        self,
        fs_data_provider: FileSystemDataProvider,
        pictures_handler: PicturesHandler,
    ) -> None:
        super().__init__()

        self.pictures_handler = pictures_handler
        self.fs_data_provider = fs_data_provider

    async def get_node(self, node_id: UUID) -> FileSystemNode:
        node = await self.fs_data_provider.get_node(node_id, include_children=True)

        if node is None:
            raise ObjectNotFound()

        if node.node_type == FileSystemNodeType.FOLDER:
            node.items = await self.fs_data_provider.get_node_children(node_id)

        return node

    async def update_node(self, node_id: UUID, data: UpdateNodeInput) -> FileSystemNode:
        node = await self.fs_data_provider.get_node(node_id, include_children=False)

        if node is None:
            raise ObjectNotFound()

        if data.etag is not None and node.etag != data.etag:
            raise PreconfitionFailed()

        # raise not implemented
        update_time = datetime.utcnow()

        node.name = data.name
        if data.parent_id is not None:
            node.parent_id = data.parent_id

        node.last_modified_time = update_time
        node.etag = update_time.isoformat()

        await self.fs_data_provider.update_nodes([node])
        return node

    async def update_nodes(
        self, data: List[UpdateNodeInput]
    ) -> Optional[FileSystemNode]:
        # TODO: support only updating multiple nodes when they belong to the same
        # parent?
        raise NotImplementedError()

    async def get_node_children(self, node_id: UUID) -> List[FileSystemNode]:
        return await self.fs_data_provider.get_node_children(node_id)

    async def get_node_path(self, node_id: UUID) -> List[FileSystemNodePathFragment]:
        return await self.fs_data_provider.get_node_path(node_id)

    async def get_full_node_path(
        self, node_id: UUID
    ) -> List[FileSystemNodePathFragment]:
        parts = await self.fs_data_provider.get_node_path(node_id)

        if not parts:
            return parts

        while parts[0].parent_id is not None:
            # continue to get the parents
            next_parts = await self.fs_data_provider.get_node_path(parts[0].parent_id)
            parts = next_parts + parts

        return parts

    @ailog()
    async def process_image(
        self, datum: CreateNodeInput, container_name: str, file_extension: str
    ) -> FileImageData:
        metadata = await self.pictures_handler.process_picture(
            container_name, f"{datum.file_id}{file_extension}"
        )
        medium_size_picture = next(
            (item for item in metadata.versions if item.size_name == "m"), None
        )
        thumbnail_size_picture = next(
            (item for item in metadata.versions if item.size_name == "s"), None
        )

        assert (
            medium_size_picture is not None
        ), "`m` size must be configured in the gallerist"

        assert (
            thumbnail_size_picture is not None
        ), "`s` size must be configured in the gallerist"

        assert medium_size_picture.file_name is not None
        assert thumbnail_size_picture.file_name is not None

        return FileImageData(
            medium_image_name=medium_size_picture.file_name,
            small_image_name=thumbnail_size_picture.file_name,
            image_width=metadata.width,
            image_height=metadata.height,
        )

    async def create_nodes(self, data: List[CreateNodeInput]) -> List[FileSystemNode]:
        nodes: List[FileSystemNode] = []
        creation_time = datetime.utcnow()

        for datum in data:
            file_extension = None
            node_type = datum.node_type or FileSystemNodeType.FOLDER
            if node_type == FileSystemNodeType.FOLDER:
                mime_type = "folder"
            else:
                mime_type = datum.file_mime or DEFAULT_MIME
                file_extension = get_file_extension_from_name(datum.name)

            image_data: Optional[FileImageData] = None

            if mime_type in handled_pictures and file_extension is not None:
                image_data = await self.process_image(
                    datum, str(datum.album_id), file_extension
                )

            slug = slugify(datum.name)

            node = FileSystemNode(
                id=uuid4(),
                album_id=datum.album_id,
                parent_id=datum.parent_id,
                file_id=datum.file_id,
                file_extension=file_extension,
                file_size=datum.file_size,
                name=datum.name,
                slug=slug,
                node_type=node_type,
                type=mime_type,
                icon=None,
                etag=creation_time.isoformat(),
                last_modified_time=creation_time,
                creation_time=creation_time,
                hidden=False,
                items=[],
                image=image_data,
            )
            nodes.append(node)

        await self.fs_data_provider.create_nodes(nodes)
        return nodes

    async def delete_nodes(self, nodes_ids: List[UUID]) -> None:
        await self.fs_data_provider.delete_nodes(nodes_ids)

    async def _initialize_copy_operation(
        self, data: CopyOperationInput, validate_source_operation: bool = False
    ) -> List[FileSystemNode]:
        nodes: List[FileSystemNode] = []

        if data.source_parent_id == data.target_parent_id:
            raise AcceptedExceptionWithData(data=[])

        if not data.nodes:
            raise InvalidArgument("Input nodes list cannot be empty")

        # make sure that all nodes belong to the same parent
        # read the source nodes, obtaining all children of the source parent;
        # make sure that their etag didn't change
        # update the nodes, to set their parent id to match the id of the new parent
        if data.source_parent_id is None:
            # virtual files at the root of an album
            original_nodes = await self.fs_data_provider.get_album_nodes(data.album_id)
        else:
            source_node = await self.fs_data_provider.get_node(
                data.source_parent_id, True
            )

            if source_node is None:
                raise ObjectNotFound("Source node not found")

            if source_node.node_type != FileSystemNodeType.FOLDER:
                raise InvalidArgument("The source node must be a folder")

            if source_node.items is None:
                # should never happen
                raise InvalidArgument("The source node must be a folder")

            original_nodes = source_node.items

        if data.target_parent_id is not None:
            target_node = await self.fs_data_provider.get_node(
                data.target_parent_id, False
            )

            if target_node is None:
                raise ObjectNotFound("Target node not found")

            if target_node.node_type != FileSystemNodeType.FOLDER:
                raise InvalidArgument("The target node must be a folder")

        full_target_path: Optional[List[FileSystemNodePathFragment]] = None

        for input_node in data.nodes:
            matching_node = next(
                (node for node in original_nodes if node.id == input_node.id), None
            )

            if matching_node is None:
                # the node might have been deleted
                raise ObjectNotFound(
                    f"Cannot find node with id {input_node.id} in the source folder"
                )

            if matching_node.etag != input_node.etag:
                raise PreconfitionFailed(
                    f"The node with id {input_node.id} and name {matching_node.name} "
                    "has been modified since it was obtained by the client."
                )

            if (
                matching_node.node_type == FileSystemNodeType.FOLDER
                and data.target_parent_id is not None
                and validate_source_operation
            ):
                if full_target_path is None:
                    full_target_path = await self.get_full_node_path(
                        data.target_parent_id
                    )

                source_node_folder = next(
                    (part for part in full_target_path if part.id == matching_node.id),
                    None,
                )

                if source_node_folder is not None:
                    # cannot copy or move a folder into itself
                    raise InvalidArgument("CannotCopyOrMoveFolderIntoItself")

            nodes.append(matching_node)

        return nodes

    async def move_nodes(self, data: CopyOperationInput) -> List[FileSystemNode]:
        modification_time = datetime.utcnow()
        nodes_to_move = await self._initialize_copy_operation(data)

        for node in nodes_to_move:
            node.last_modified_time = modification_time
            node.etag = modification_time.isoformat()
            node.parent_id = data.target_parent_id

        await self.fs_data_provider.update_nodes(nodes_to_move)

        return nodes_to_move

    async def paste_nodes(
        self, data: CopyOperationInput, source_operation: bool = True
    ) -> List[FileSystemNode]:
        creation_time = datetime.utcnow()
        nodes_to_paste = await self._initialize_copy_operation(
            data, validate_source_operation=source_operation
        )
        cloned_folders_by_original_id: Dict[UUID, UUID] = {}

        for node in nodes_to_paste:
            new_id = uuid4()

            if node.node_type == FileSystemNodeType.FOLDER:
                cloned_folders_by_original_id[node.id] = new_id

            node.id = new_id
            node.creation_time = creation_time
            node.last_modified_time = creation_time
            node.etag = creation_time.isoformat()
            node.parent_id = data.target_parent_id

        await self.fs_data_provider.create_nodes(nodes_to_paste)

        if cloned_folders_by_original_id:
            for original_node_id, new_node_id in cloned_folders_by_original_id.items():
                children = await self.fs_data_provider.get_node_children(
                    original_node_id
                )
                await self.paste_nodes(
                    CopyOperationInput(
                        album_id=data.album_id,
                        source_parent_id=original_node_id,
                        target_parent_id=new_node_id,
                        nodes=[
                            UpdateNodeInput(
                                id=child.id,
                                name=child.name,
                                etag=child.etag,
                                parent_id=original_node_id,
                            )
                            for child in children
                        ],
                    ),
                    source_operation=False,
                )

        return nodes_to_paste
