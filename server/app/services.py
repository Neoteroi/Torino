"""
Use this module to register all required services.
Services registered inside a `rodi.Container` are automatically injected into request
handlers.

For more information and documentation, see:
    https://www.neoteroi.dev/blacksheep/dependency-injection/
"""
from blacksheep.server.application import Application
from blacksheepsqlalchemy import use_sqlalchemy

from core.events import ServicesRegistrationContext
from data.azstorage.services import (register_az_storage_services,
                                     use_storage_table)
from data.sql.services import register_sql_services
from domain.context import register_user_services
from domain.services import register_handlers
from domain.settings import Settings


def configure_services(
    app: Application,
    settings: Settings,
) -> ServicesRegistrationContext:
    container = app.services

    context = ServicesRegistrationContext()

    container.add_instance(settings)

    register_handlers(container, context)

    if settings.db_connection_string:
        use_sqlalchemy(app, connection_string=settings.db_connection_string)
    else:
        use_storage_table(app, settings)

    register_sql_services(container)
    register_az_storage_services(container, settings)

    register_user_services(container)

    return context
