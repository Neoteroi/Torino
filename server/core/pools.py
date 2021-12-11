import asyncio
from asyncio import AbstractEventLoop, BaseEventLoop
from concurrent.futures.thread import ThreadPoolExecutor
from typing import Any, Callable, Optional, TypeVar

T = TypeVar("T")


class PoolClient:
    def __init__(
        self,
        loop: Optional[BaseEventLoop] = None,
        executor: Optional[ThreadPoolExecutor] = None,
    ):
        self._loop = loop or asyncio.get_event_loop()
        self._executor = executor

    @property
    def loop(self) -> AbstractEventLoop:
        return self._loop

    async def run(self, func: Callable[..., T], *args: Any) -> T:
        return await self._loop.run_in_executor(self._executor, func, *args)
