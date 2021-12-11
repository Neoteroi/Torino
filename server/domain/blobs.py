from dataclasses import dataclass
from typing import List
from uuid import uuid4

from core.pathutils import get_best_mime_type

from .settings import Settings


@dataclass
class InitializeUploadInput:
    container_id: str
    file_name: str
    file_size: int
    file_type: str


@dataclass
class InitializeUploadOutput:
    base_url: str
    file_id: str
    file_name: str
    token: str


@dataclass
class Container:
    id: str
    name: str
    etag: str


class BlobsService:
    async def get_containers(self) -> List[Container]:
        raise NotImplementedError

    async def create_container(self, name: str) -> None:
        raise NotImplementedError

    def get_read_blob_sas(
        self,
        container_name: str,
        file_name: str,
        display_name: str,
    ) -> str:
        raise NotImplementedError

    def get_read_container_sas(self, container_name: str) -> str:
        raise NotImplementedError

    def get_admin_blob_sas(self, container_name: str, assigned_file_name: str) -> str:
        raise NotImplementedError


class BlobsHandler:
    def __init__(self, blobs_service: BlobsService, settings: Settings) -> None:
        self.blobs_service = blobs_service
        self.settings = settings

    def get_container_url(self, container_name: str) -> str:
        return self.settings.file_upload_url + container_name + "/"

    async def initialize_upload(
        self, data: InitializeUploadInput
    ) -> InitializeUploadOutput:
        container_name = data.container_id
        extension, _ = get_best_mime_type(data.file_name)

        file_id = str(uuid4())
        # TODO: let use original file name by configuration
        assigned_file_name = file_id + extension

        token = self.blobs_service.get_admin_blob_sas(
            container_name, assigned_file_name
        )
        return InitializeUploadOutput(
            self.get_container_url(container_name), file_id, assigned_file_name, token
        )
