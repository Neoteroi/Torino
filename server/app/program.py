import os

import app.controllers  # noqa
from blacksheep.server.application import Application
from blacksheepsqlalchemy import use_sqlalchemy
from core.events import ServicesRegistrationContext

from configuration.common import Configuration, ConfigurationBuilder
from configuration.env import EnvironmentVariables
from configuration.yaml import YAMLFile

from .docs import docs
from .errors import configure_error_handlers
from .logs import configure_logging
from .services import configure_services


def load_configuration() -> Configuration:
    env_name = os.environ.get("APP_ENV", "prod")
    builder = ConfigurationBuilder(
        YAMLFile("settings.yaml"),
        YAMLFile(f"settings.{env_name}.yaml", optional=True),
        EnvironmentVariables("APP_"),
    )
    return builder.build()


def build_app() -> Application:
    configuration = load_configuration()
    context: ServicesRegistrationContext
    services, context, settings = configure_services(configuration)
    configuration: Configuration

    app = Application(
        services=services,
        show_error_details=configuration.show_error_details,
        debug=configuration.debug,
    )

    use_sqlalchemy(app, connection_string=configuration.db_connection_string)

    # app.middlewares.append(dependency_injection_middleware)

    configure_error_handlers(app)
    configure_logging(app, settings)

    app.use_cors(
        allow_methods="*",
        allow_origins="*",
        allow_headers="*",
        max_age=900,
    )

    docs.bind_app(app)
    return app
