from configuration.common import Configuration
from pydantic import BaseModel


class Settings(BaseModel):

    storage_account_name: str

    storage_account_key: str

    monitoring_key: str

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
        return cls(
            storage_account_name=configuration.storage_account_name,
            storage_account_key=configuration.storage_account_key,
            monitoring_key=configuration.monitoring_key,
        )
