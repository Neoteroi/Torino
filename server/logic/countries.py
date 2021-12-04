from typing import List

from domain.countries import CountriesDataProvider, Country


class CountriesHandler:
    countries_data_provider: CountriesDataProvider

    async def get_countries(self) -> List[Country]:
        return await self.countries_data_provider.get_countries()
