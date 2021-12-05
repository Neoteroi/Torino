from blacksheep.server.authorization import auth
from blacksheep.server.controllers import ApiController, post

from domain import Features
from domain.blobs import BlobsHandler, InitializeUploadInput, InitializeUploadOutput


class BlobsController(ApiController):
    def __init__(self, manager: BlobsHandler) -> None:
        super().__init__()

        self.manager = manager

    @classmethod
    def class_name(cls) -> str:
        return "blobs"

    @auth(Features.UPLOAD)
    @post("/initialize-upload")
    async def initialize_upload(
        self, data: InitializeUploadInput
    ) -> InitializeUploadOutput:
        return await self.manager.initialize_upload(data)
