from typing import Optional

from configuration.common import Configuration
from configuration.errors import ConfigurationError
from pydantic import BaseModel

from core.stringutils import split_pairs_eqsc


def read_account_name_and_key(configuration: Configuration):
    if "storage_account_connection_string" in configuration:
        connstring = configuration.storage_account_connection_string
        values = split_pairs_eqsc(connstring.lower())

        if "accountname" in values and "accountkey" in values:
            account_name = values["accountname"]
            account_key = values["accountkey"]
            return account_name, account_key
        else:
            raise ConfigurationError(f"Invalid connection string: {connstring}")

    if (
        "storage_account_name" not in configuration
        or not configuration.storage_account_name
    ):
        raise ConfigurationError("Missing setting `storage_account_name`")

    if (
        "storage_account_key" not in configuration
        or not configuration.storage_account_key
    ):
        raise ConfigurationError("Missing setting `storage_account_key`")

    return configuration.storage_account_name, configuration.storage_account_key


class AuthSettings(BaseModel):
    audience: str
    issuer: str


class Settings(BaseModel):

    storage_account_name: str

    storage_account_key: str

    db_connection_string: str

    monitoring_key: str

    auth: Optional[AuthSettings] = None

    @property
    def storage_connection_string(self) -> str:
        return (
            "DefaultEndpointsProtocol=https;"
            f"AccountName={self.storage_account_name};"
            f"AccountKey={self.storage_account_key};"
            "EndpointSuffix=core.windows.net"
        )

    @property
    def file_upload_url(self) -> str:
        return f"https://{self.storage_account_name}.blob.core.windows.net/"

    @classmethod
    def from_configuration(cls, configuration: Configuration) -> "Settings":
        account_name, account_key = read_account_name_and_key(configuration)
        return cls(
            storage_account_name=account_name,
            storage_account_key=account_key,
            db_connection_string=configuration.db_connection_string or "",
            monitoring_key=configuration.monitoring_key,
            auth=AuthSettings(
                audience=configuration.auth.audience or "",
                issuer=configuration.auth.issuer or "",
            )
            if "auth" in configuration
            else None,
        )
