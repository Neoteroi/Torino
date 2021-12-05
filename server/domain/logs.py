from contextlib import contextmanager
from functools import wraps

from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import AlwaysOnSampler
from opencensus.trace.span import SpanKind
from opencensus.trace.tracer import Tracer


@contextmanager
def operation_context(component, operation_name, *args, **kwargs):
    tracer = Tracer(
        exporter=AzureExporter(),
        sampler=AlwaysOnSampler(),
    )

    with tracer.span(name=operation_name) as span:
        span.span_kind = SpanKind.CLIENT
        span.add_attribute("component", component)

        for i, value in enumerate(args):
            span.add_attribute(f"@arg{i}", str(value))

        for key, value in kwargs.items():
            span.add_attribute(f"@{key}", str(value))

        try:
            yield
        except Exception as ex:
            span.add_attribute("ERROR", str(ex))
            span.add_attribute("http.status_code", 500)
            raise


def ailog(component="Service"):
    """
    Logs a dependency.
    """

    def ailog_decorator(fn):
        @wraps(fn)
        async def wrapper(self, *args, **kwargs):
            with operation_context(component, fn.__name__, *args, **kwargs):
                return await fn(self, *args, **kwargs)

        return wrapper

    return ailog_decorator
