import os

from blacksheep.server.application import Application
from blacksheepsqlalchemy import use_sqlalchemy
from configuration.common import Configuration, ConfigurationBuilder
from configuration.env import EnvironmentVariables
from configuration.yaml import YAMLFile
from core.events import ServicesRegistrationContext
from essentials.folders import ensure_folder

import app.controllers  # noqa
from app.security.httpsmiddleware import HSTSMiddleware

from .auth import configure_auth
from .di import dependency_injection_middleware
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
    )

    configure_logging(app, settings)
    use_sqlalchemy(app, connection_string=configuration.db_connection_string)

    app.on_start += context.initialize
    app.on_stop += context.dispose

    app.middlewares.append(dependency_injection_middleware)

    # Note: HTTP -> HTTPS redirection is not needed, because
    # it is configured in the hosting service (see template.bicep httpsOnly)
    if configuration.hsts:
        app.middlewares.append(HSTSMiddleware())

    configure_auth(app, configuration)
    configure_error_handlers(app)

    ensure_folder("app/static")
    app.serve_files("app/static", fallback_document="index.html", allow_anonymous=True)

    app.use_cors(
        allow_methods="*",
        allow_origins="*",
        allow_headers="*",
        max_age=900,
    )

    docs.bind_app(app)
    return app
