from typing import List
from uuid import UUID

from blacksheep import Response
from blacksheep.server.authorization import auth
from blacksheep.server.controllers import ApiController, get, post

from app.decorators.cachecontrol import cache_control
from domain import Features
from domain.albums import (
    Album,
    AlbumsHandler,
    ContainerReadAuthContext,
    CreateAlbumInput,
    DownloadURL,
    UpdateAlbumInput,
)
from domain.vfs import FileSystemNode


class AlbumsController(ApiController):
    def __init__(self, manager: AlbumsHandler) -> None:
        super().__init__()

        self.manager = manager

    @classmethod
    def class_name(cls) -> str:
        return "albums"

    @get("/")
    async def get_albums(self) -> List[Album]:
        return await self.manager.get_albums()

    @get("/:album_id")
    async def get_album_details(self, album_id: UUID) -> Album:
        return await self.manager.get_album(album_id)

    @auth(Features.ALBUMS_WRITE)
    @post("/:album_id")
    async def update_album(self, album_id: UUID, data: UpdateAlbumInput) -> Album:
        return await self.manager.update_album(data)

    @get("/:album_id/container-context")
    async def get_album_container_context(
        self, album_id: UUID
    ) -> ContainerReadAuthContext:
        return await self.manager.get_album_container_context(album_id)

    @get("/:album_id/nodes")
    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        return await self.manager.get_album_nodes(album_id)

    @auth(Features.ALBUMS_WRITE)
    @post("/")
    async def create_album(self, data: CreateAlbumInput) -> Response:
        if not data or not data.name:
            return self.bad_request()

        return self.created(await self.manager.create_album(data))

    @get("/file/:node_id")
    @cache_control(max_age=300)
    async def download_file(self, node_id: UUID) -> DownloadURL:
        return DownloadURL(url=await self.manager.get_file_url(node_id))
