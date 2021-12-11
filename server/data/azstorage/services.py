import asyncio
import aiohttp
from core.events import ServicesRegistrationContext
from azure.storage.blob import BlobServiceClient
from azure.data.tables.aio import TableServiceClient
from rodi import Container

from domain.albums import AlbumsDataProvider
from domain.blobs import BlobsService
from domain.settings import Settings
from domain.vfs import FileSystemDataProvider

from .albums import TableAPIAlbumsDataProvider
from .blobs import AzureStorageBlobsService
from .vfs import TableAPIFileSystemDataProvider


def register_storage_blob(container: Container, settings: Settings) -> None:
    """
    Configures the services using the Blob API of the Storage Account.

    Currently the application supports a single Storage Account, but it could
    be refactored to support attaching multiple (storing their key in a
    Azure Key Vault).
    """
    container.add_instance(
        BlobServiceClient.from_connection_string(settings.storage_connection_string)
    )

    container.add_singleton(BlobsService, AzureStorageBlobsService)


def use_storage_table(
    container: Container, settings: Settings, context: ServicesRegistrationContext
) -> None:
    """
    Configures the application to use the Table API in the Storage Account,
    as a persistence layer for the metadata necessary for the virtual file
    system.

    This has the benefit that the system is extremely cost effective, but has the
    considerable downside that querying capabilities are dramatically reduced:
    no support for count, indexes, foreign keys, search, queries with joins,
    and other features that are available in SQL but not in the Table API.

    Some features in the future will be supported only if a SQL db is used.
    """
    aiohttp_client_session = None

    # initialize:
    # * configure the aiohttp client session, this needs to happen in the
    #   startup event
    # * creating tables if they don't exist
    async def initialize_tables():
        nonlocal aiohttp_client_session
        jar = aiohttp.DummyCookieJar()
        aiohttp_client_session = aiohttp.ClientSession(
            loop=asyncio.get_event_loop(),
            trust_env=True,
            cookie_jar=jar,
            auto_decompress=False,
        )
        table_service_client = TableServiceClient.from_connection_string(
            conn_str=settings.storage_connection_string, session=aiohttp_client_session
        )

        container.add_instance(table_service_client)

        async with table_service_client:
            await table_service_client.create_table_if_not_exists(
                TableAPIAlbumsDataProvider.table_name
            )
            await table_service_client.create_table_if_not_exists(
                TableAPIFileSystemDataProvider.table_name
            )

    async def dispose_client():
        nonlocal aiohttp_client_session
        await aiohttp_client_session.close()

    context.initialize += initialize_tables
    context.dispose += dispose_client

    container.add_scoped(AlbumsDataProvider, TableAPIAlbumsDataProvider)
    container.add_scoped(FileSystemDataProvider, TableAPIFileSystemDataProvider)
