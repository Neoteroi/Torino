from rodi import Container
from concurrent.futures import ThreadPoolExecutor, Executor

from core.events import ServicesRegistrationContext
from .albums import AlbumsHandler
from .blobs import BlobsHandler
from .pictures import PicturesHandler
from .vfs import FileSystemHandler


def register_handlers(
    container: Container, context: ServicesRegistrationContext
) -> None:

    container.add_scoped(FileSystemHandler)
    container.add_scoped(AlbumsHandler)
    container.add_scoped(BlobsHandler)
    container.add_scoped(PicturesHandler)

    # region gallerist

    # note: a process pool executor is registered to do CPU bound operations of
    # picture resizing with Pillow in dedicated processes.
    # the process pool executor is disposed gracefully when the application stops,
    # and it is injected into the Pictures handler for its Executor dependency.
    pool = ThreadPoolExecutor(max_workers=4)

    container.add_instance(pool, declared_class=Executor)

    async def release_pool():
        nonlocal pool

        if pool is not None:
            pool.shutdown(wait=True)

    context.dispose += release_pool
    # endregion
