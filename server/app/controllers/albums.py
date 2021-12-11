from typing import List
from uuid import UUID

from blacksheep import Response
from blacksheep.server.authorization import auth
from blacksheep.server.controllers import ApiController, get, post

from app.decorators.cachecontrol import cache_control
from domain import Roles
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
        """
        Gets the list of albums configured in the system.
        """
        return await self.manager.get_albums()

    @get("/:album_id")
    async def get_album_details(self, album_id: UUID) -> Album:
        """
        Gets details about an album, by its id.
        """
        return await self.manager.get_album(album_id)

    @auth(Roles.ADMIN)
    @post("/:album_id")
    async def update_album(self, album_id: UUID, data: UpdateAlbumInput) -> Album:
        """
        Updates an album by id, with the given input.
        """
        return await self.manager.update_album(data)

    @get("/:album_id/container-context")
    async def get_album_container_context(
        self, album_id: UUID
    ) -> ContainerReadAuthContext:
        """
        Gets information that is necessary to download files from the private container
        associated with an album.
        """
        return await self.manager.get_album_container_context(album_id)

    @get("/:album_id/nodes")
    async def get_album_nodes(self, album_id: UUID) -> List[FileSystemNode]:
        """
        Gets the list of root folders of an album, by id.
        """
        return await self.manager.get_album_nodes(album_id)

    @auth(Roles.ADMIN)
    @post("/")
    async def create_album(self, data: CreateAlbumInput) -> Response:
        """
        Creates a new album and a private container for files.
        """
        if not data or not data.name:
            return self.bad_request()

        return self.created(await self.manager.create_album(data))

    @get("/file/:node_id")
    @cache_control(max_age=300)
    async def download_file(self, node_id: UUID) -> DownloadURL:
        """
        Gets information to redirect the user to a download URL,
        including a temporary access token to authorize the download.
        """
        return DownloadURL(url=await self.manager.get_file_url(node_id))
