import asyncio
from concurrent.futures import Executor

from gallerist import Gallerist, ImageMetadata, ImageSize
from galleristazurestorage import AzureBlobFileStore
from domain.settings import Settings


class PicturesHandler:
    def __init__(self, executor: Executor, settings: Settings) -> None:
        self.loop = asyncio.get_event_loop()
        self.pool = executor
        self.settings = settings

    def get_gallerist(self, container_name: str) -> Gallerist:
        return Gallerist(
            AzureBlobFileStore.from_connection_string(
                self.settings.storage_connection_string, container_name
            ),
            sizes={
                "image/jpeg": [
                    ImageSize("m", 1200),
                    ImageSize("s", 300),
                ],
                "image/png": [
                    ImageSize("m", 1200),
                    ImageSize("s", 300),
                ],
            },
        )

    async def process_picture(
        self, container_name: str, file_name: str
    ) -> ImageMetadata:
        gallerist = self.get_gallerist(container_name)

        return await self.loop.run_in_executor(
            self.pool, gallerist.process_image, file_name
        )
