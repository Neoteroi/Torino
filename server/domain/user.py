from typing import List
from guardpost.authentication import Identity


class User(Identity):
    @property
    def id(self):
        return self["oid"]

    @property
    def name(self):
        return self["name"]

    @property
    def email(self):
        return self["email"]

    @property
    def roles(self) -> List[str]:
        roles = self.claims.get("roles")
        if not roles:
            return []
        assert isinstance(roles, list)
        return roles

    def has_role(self, role_name: str) -> bool:
        return role_name in self.roles

    def __str__(self) -> str:
        return f"<User {self['preferred_username']}>"
