from azure.storage.blob import BlobServiceClient
from rodi import Container

from domain.blobs import BlobsService
from domain.settings import Settings

from .blobs import AzureStorageBlobsService


def register_az_storage_services(container: Container, settings: Settings) -> None:
    container.add_instance(
        BlobServiceClient.from_connection_string(settings.storage_connection_string)
    )

    container.add_singleton(BlobsService, AzureStorageBlobsService)
