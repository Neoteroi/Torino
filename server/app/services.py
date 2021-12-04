"""
Use this module to register required services.
Services registered inside a `rodi.Container` are automatically injected into request
handlers.

For more information and documentation, see:
    https://www.neoteroi.dev/blacksheep/dependency-injection/
"""
import os
from typing import Tuple

from core.events import ServicesRegistrationContext
from data.sql.services import register_sqldb_services
from rodi import Container
from domain import register_handlers
from domain.settings import Settings

from configuration.common import Configuration


def configure_services(
    configuration: Configuration,
) -> Tuple[Container, ServicesRegistrationContext, Settings]:
    container = Container()

    context = ServicesRegistrationContext()

    container.add_instance(configuration)

    settings = Settings.from_configuration(configuration)

    # set an env variable that is used internally by
    # opencensus.ext.azure.trace_exporter.AzureExporter
    os.environ[
        "APPLICATIONINSIGHTS_CONNECTION_STRING"
    ] = f"InstrumentationKey={settings.monitoring_key}"

    container.add_instance(settings)

    register_handlers(container)

    register_sqldb_services(container, context)

    return container, context, settings
