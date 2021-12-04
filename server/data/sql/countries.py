from typing import List

from domain.countries import CountriesDataProvider, Country
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import select

from .dbmodel import Country as CountryEntity


class SqlCountriesDataProvider(CountriesDataProvider):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__()
        self.session = session

    async def get_countries(self) -> List[Country]:
        result: List[Country] = []
        async with self.session:
            results = await self.session.execute(
                select(CountryEntity).order_by(CountryEntity.english_name)
            )
            for record in results.scalars():
                result.append(Country(record.id, record.english_name, record.code))
        return result
