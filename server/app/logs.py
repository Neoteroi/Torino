import logging
from functools import wraps
from typing import Awaitable, Callable, Optional

from blacksheep.messages import Request, Response
from blacksheep.server.application import Application
from blacksheep.server.routing import RouteMatch
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace import config_integration
from opencensus.trace.samplers import AlwaysOnSampler
from opencensus.trace.span import SpanKind
from opencensus.trace.tracer import Tracer
from domain.settings import Settings

# configures span id
config_integration.trace_integrations(["logging"])


# Configure a telemetry processor to improve how SQLAlchemy logs are organized;
# See:
# https://github.com/census-instrumentation/opencensus-python/issues/1037
# https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-filtering-sampling#opencensus-python-telemetry-processors
# Callback function to append '_hello' to each log message telemetry
def sql_alchemy_entries_by_query(envelope):
    if envelope.data.baseData.get("name") == "sqlalchemy.query":
        envelope.data.baseData["type"] = "SQLAlchemy"
        envelope.data.baseData["name"] = envelope.data.baseData["properties"][
            "sqlalchemy.query"
        ].replace("\n", "")
    return envelope


def configure_logging(app: Application, settings: Settings) -> None:
    logger = logging.getLogger("blacksheep.server")

    logger.setLevel(logging.INFO)
    logger.addHandler(logging.StreamHandler())

    # For telemetry sent with the Azure Monitor logs exporter, logs appear under traces.
    # Exceptions appear under exceptions.
    # So, `logger.info` are found in traces logs, `logger.exception` under exceptions
    handler = AzureLogHandler(
        connection_string=f"InstrumentationKey={settings.monitoring_key}"
    )
    handler.add_telemetry_processor(sql_alchemy_entries_by_query)
    logger.addHandler(handler)

    # For telemetry sent with the Azure Monitor logs exporter, logs appear under traces.
    # Exceptions appear under exceptions.
    exporter = AzureExporter(
        connection_string=f"InstrumentationKey={settings.monitoring_key}"
    )
    exporter.add_telemetry_processor(sql_alchemy_entries_by_query)
    tracer = Tracer(
        exporter=exporter,
        sampler=AlwaysOnSampler(),
    )

    # wrap app.handle to log every web request, even those that fail due to exceptions
    # and are handled by BaseApplication class
    def wrap_handle(
        fn: Callable[[Request], Awaitable[Response]]
    ) -> Callable[[Request], Awaitable[Response]]:
        @wraps(fn)
        async def handle(request: Request) -> Response:
            with tracer.span(name="request") as span:
                span.span_kind = SpanKind.SERVER
                request_path = request.url.path.decode("utf8")
                span.add_attribute("http.method", request.method)
                span.add_attribute("http.path", request_path)
                span.add_attribute("http.url", request.url.value.decode())
                response = await fn(request)
                span.add_attribute("http.route", request.route)  # type: ignore
                span.add_attribute("http.status_code", response.status)
                return response

        return handle

    app.handle = wrap_handle(app.handle)  # type: ignore

    def wrap_get_route_match(
        fn: Callable[[Request], Optional[RouteMatch]]
    ) -> Callable[[Request], Optional[RouteMatch]]:
        @wraps(fn)
        def get_route_match(request: Request) -> Optional[RouteMatch]:
            match = fn(request)
            if match:
                request.route = match.pattern.decode()  # type: ignore
            else:
                request.route = "Not Found"  # type: ignore

            return match

        return get_route_match

    app.get_route_match = wrap_get_route_match(app.get_route_match)  # type: ignore
