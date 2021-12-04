from abc import ABC
from uuid import UUID
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


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
