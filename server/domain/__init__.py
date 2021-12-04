from rodi import Container

from .countries import CountriesHandler


def register_handlers(container: Container) -> None:
    container.add_scoped(CountriesHandler)
