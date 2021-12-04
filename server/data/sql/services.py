from core.events import ServicesRegistrationContext
from domain.countries import CountriesDataProvider
from opencensus.trace import config_integration
from rodi import Container

from .countries import SqlCountriesDataProvider

config_integration.trace_integrations(["sqlalchemy"])


def register_sqldb_services(
    container: Container, context: ServicesRegistrationContext
) -> None:
    container.add_scoped(CountriesDataProvider, SqlCountriesDataProvider)
