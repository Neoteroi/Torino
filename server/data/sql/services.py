from rodi import Container

from domain.albums import AlbumsDataProvider
from domain.vfs import FileSystemDataProvider

from .albums import SQLAlbumsDataProvider
from .vfs import SQLFileSystemDataProvider


def register_sql_services(container: Container) -> None:
    # services **MUST** be scoped here!
    container.add_scoped(AlbumsDataProvider, SQLAlbumsDataProvider)
    container.add_scoped(FileSystemDataProvider, SQLFileSystemDataProvider)
