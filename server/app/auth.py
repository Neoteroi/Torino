from typing import Sequence
from blacksheep.server.application import Application
from blacksheep.server.authentication.jwt import JWTBearerAuthentication
from configuration.common import Configuration
from guardpost.authorization import AuthorizationContext, Policy
from guardpost.common import AuthenticatedRequirement
from guardpost.synchronous.authorization import Requirement


class RoleRequirement(Requirement):
    """Requires an authenticated user, with any of the required roles."""

    def __init__(self, *sufficient_roles: Sequence[str]) -> None:
        super().__init__()
        self.sufficient_roles = list(sufficient_roles)

    def _has_role(self, identity) -> bool:
        roles = identity.claims.get("roles", [])

        for sufficient_role in self.sufficient_roles:
            if sufficient_role in roles:
                return True

        return False

    def handle(self, context: AuthorizationContext):
        identity = context.identity

        if identity and identity.is_authenticated() and self._has_role(identity):
            context.succeed(self)


def configure_auth(app: Application, config: Configuration) -> None:
    app.use_authentication().add(
        JWTBearerAuthentication(
            authority=config.auth.issuer,
            valid_audiences=[config.auth.audience],
        )
    )

    authorization = app.use_authorization().with_default_policy(
        Policy("authenticated", AuthenticatedRequirement())
    )

    authorization += Policy("ADMIN", RoleRequirement("ADMIN"))
