from dataclasses import dataclass
from typing import List


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
