from dataclasses import dataclass
from uuid import UUID, uuid4

from blacksheep.messages import Request
from rodi import Container, GetServiceContext

from .user import User


@dataclass
class OperationContext:
    operation_id: UUID
    user: User


def register_user_services(container: Container) -> None:
    def context_binder(context: GetServiceContext) -> OperationContext:
        assert isinstance(context.scoped_services, dict)
        request = context.scoped_services[Request]

        if hasattr(request, "identity"):
            user = request.identity
        else:
            user = User({})

        return OperationContext(operation_id=uuid4(), user=user)

    container.add_scoped_by_factory(context_binder)  # type: ignore
