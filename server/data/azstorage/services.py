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


def use_storage_table(container: Container, settings: Settings) -> None:
    """
    Configures the application to use the Table API in the Storage Account,
    as a persistence layer for the metadata necessary for the virtual file
    system.

    This has the benefit that the system is extremely inexpensive, but has the
    considerable downside that querying capabilities on the data are dramatically
    reduced: no support for COUNT, search, queries with joins, and all other
    features that are available in SQL but not in the Table API.

    Some features in the future will be supported only if a SQL db is used.
    """
