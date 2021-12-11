from abc import ABC
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from essentials.exceptions import ObjectNotFound
from slugify import slugify

from core.errors import PreconfitionFailed
from domain.blobs import BlobsService

from .context import OperationContext
from .settings import Settings
from .vfs import FileSystemDataProvider, FileSystemNode

DEFAULT_STORAGE = UUID("00000000-0000-0000-0000-000000000000")


@dataclass
class Album:
    id: UUID
    storage_id: UUID
    name: str
    slug: str
    image_url: str
    description: Optional[str]
    last_modified_time: datetime
    creation_time: datetime
    etag: str
    items: Optional[List[FileSystemNode]]
    public: bool


@dataclass
class DownloadURL:
    url: str


@dataclass
class ContainerReadAuthContext:
    base_url: str
    token: str


@dataclass
class CreateAlbumInput:
    name: str
    description: Optional[str]
    image_url: str
    storage_id: Optional[str]
    public: bool


@dataclass
class UpdateAlbumInput:
    id: UUID
    name: str
    image_url: str
    description: Optional[str]
    public: bool
    etag: str


class AlbumsDataProvider(ABC):
    async def get_album(self, album_id: UUID) -> Optional[Album]:
        raise NotImplementedError()

    async def get_albums(self) -> List[Album]:
        raise NotImplementedError()

    async def create_album(self, data: Album) -> None:
        raise NotImplementedError()

    async def update_album(self, data: Album) -> None:
        raise NotImplementedError()


class AlbumsHandler:
    def __init__(
        self,
        albums_data_provider: AlbumsDataProvider,
        blobs_service: BlobsService,
        fs_data_provider: FileSystemDataProvider,
        settings: Settings,
        context: OperationContext,
    ) -> None:
        super().__init__()

        self.fs_data_provider = fs_data_provider
        self.albums_data_provider = albums_data_provider
        self.blobs_service = blobs_service
        self.settings = settings
        self.context = context

    def get_container_url(self, album_id: str) -> str:
        return (
            f"https://{self.settings.storage_account_name}"
            f".blob.core.windows.net/{album_id}/"
        )

    async def get_file_url(self, node_id: UUID) -> str:
        node = await self.fs_data_provider.get_node(node_id, include_children=False)

        if not node:
            raise ObjectNotFound()

        if node.file_id is None or node.file_extension is None:
            raise ObjectNotFound()

        album_id = str(node.album_id)
        token = self.blobs_service.get_read_blob_sas(
            album_id, node.file_id + node.file_extension, node.name
        )

        return (
            self.get_container_url(album_id)
            + node.file_id
            + node.file_extension
            + "?"
            + token
        )

    async def get_albums(self) -> List[Album]:
        return await self.albums_data_provider.get_albums()

    async def get_album(self, album_id: UUID) -> Album:
        album = await self.albums_data_provider.get_album(album_id)

        if album is None:
            raise ObjectNotFound()

        return album

    async def get_album_container_context(
        self, album_id: UUID
    ) -> ContainerReadAuthContext:
        return ContainerReadAuthContext(
            base_url=self.get_container_url(str(album_id)),
            token=self.blobs_service.get_read_container_sas(str(album_id)),
        )

    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        return await self.fs_data_provider.get_album_nodes(album_id)

    async def update_album(self, data: UpdateAlbumInput) -> Album:
        album = await self.get_album(data.id)

        if not album:
            raise ObjectNotFound()

        if album.etag != data.etag:
            raise PreconfitionFailed()

        current_time = datetime.utcnow()

        album.last_modified_time = current_time
        album.etag = current_time.isoformat()

        if data.name:
            album.name = data.name

        if data.description:
            album.description = data.description

        if data.public != album.public:
            # TODO: support changing the container's access level
            pass

        await self.albums_data_provider.update_album(album)
        return album

    async def create_album(self, data: CreateAlbumInput) -> Album:
        current_time = datetime.utcnow()

        storage_id = UUID(data.storage_id) if data.storage_id else DEFAULT_STORAGE
        slug = slugify(data.name)

        album = Album(
            id=uuid4(),
            name=data.name,
            slug=slug,
            description=data.description,
            etag=current_time.isoformat(),
            last_modified_time=current_time,
            creation_time=current_time,
            storage_id=storage_id,
            image_url=data.image_url,
            items=None,
            public=data.public,
        )

        await self.blobs_service.create_container(str(album.id))
        await self.albums_data_provider.create_album(album)
        return album
