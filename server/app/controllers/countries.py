from typing import List

from blacksheep.server.controllers import ApiController, get
from domain.countries import Country
from logic.countries import CountriesHandler


class CountriesController(ApiController):
    def __init__(self, manager: CountriesHandler) -> None:
        super().__init__()

        self.manager = manager

    @classmethod
    def class_name(cls) -> str:
        return "countries"

    @get("/")
    async def get_countries(self) -> List[Country]:
        """
        Gets the list of countries configured in the system.
        """
        return await self.manager.get_countries()
