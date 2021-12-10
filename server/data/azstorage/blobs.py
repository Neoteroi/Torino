import urllib.parse
from datetime import datetime, timedelta
from functools import partial
from typing import List, cast

from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import (BlobSasPermissions, BlobServiceClient,
                                ContainerSasPermissions, generate_blob_sas,
                                generate_container_sas)

from core.errors import ConflictError
from core.pools import PoolClient
from domain.blobs import BlobsService, Container
from domain.logs import log_dep
from domain.settings import Settings


def _list_containers(blob_client: BlobServiceClient) -> List[Container]:
    containers: List[Container] = []

    for item in blob_client.list_containers():
        containers.append(Container(id=item.name, name=item.name, etag=item.etag))

    return containers


def _create_container(blob_client: BlobServiceClient, name: str) -> None:
    try:
        blob_client.create_container(name=name)
    except ResourceExistsError:
        raise ConflictError("A container with the given name already exists")


log_az_dep = partial(log_dep, "AzureStorage")


class AzureStorageBlobsService(BlobsService, PoolClient):
    def __init__(self, blob_client: BlobServiceClient, settings: Settings) -> None:
        super().__init__()
        self.blob_client = blob_client
        self.settings = settings

    @log_az_dep()
    async def get_containers(self) -> List[Container]:
        return await self.run(_list_containers, self.blob_client)

    @log_az_dep()
    async def create_container(self, name: str) -> None:
        return await self.run(_create_container, self.blob_client, name)

    def get_read_blob_sas(
        self,
        container_name: str,
        file_name: str,
        display_name: str,
    ) -> str:
        escaped_name = urllib.parse.quote(display_name)
        token = generate_blob_sas(
            account_name=self.settings.storage_account_name,
            account_key=self.settings.storage_account_key,
            container_name=container_name,
            blob_name=file_name,
            permission=BlobSasPermissions(read=True, create=False, write=False),
            expiry=datetime.utcnow() + timedelta(hours=2),
            content_disposition=f'attachment;filename="{escaped_name}"',
        )

        return cast(str, token)

    def get_read_container_sas(self, container_name: str) -> str:
        token = generate_container_sas(
            account_name=self.settings.storage_account_name,
            account_key=self.settings.storage_account_key,
            container_name=container_name,
            permission=ContainerSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=24),
        )

        return cast(str, token)

    def get_admin_blob_sas(self, container_name: str, file_name: str) -> str:
        token = generate_blob_sas(
            account_name=self.settings.storage_account_name,
            account_key=self.settings.storage_account_key,
            container_name=container_name,
            blob_name=file_name,
            permission=BlobSasPermissions(read=True, create=True, write=True),
            expiry=datetime.utcnow() + timedelta(hours=2),
        )

        return cast(str, token)
