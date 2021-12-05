"""
Use this module to register all required services.
Services registered inside a `rodi.Container` are automatically injected into request
handlers.

For more information and documentation, see:
    https://www.neoteroi.dev/blacksheep/dependency-injection/
"""
import os
from typing import Tuple

from configuration.common import Configuration
from core.events import ServicesRegistrationContext
from data.azstorage.services import register_az_storage_services
from data.sql.services import register_sql_services
from domain.context import register_user_services
from domain.services import register_handlers
from domain.settings import Settings
from rodi import Container


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

    register_handlers(container, context)

    register_sql_services(container)
    register_az_storage_services(container, settings)

    register_user_services(container)

    return container, context, settings
