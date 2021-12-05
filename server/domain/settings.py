from pydantic import BaseModel

from configuration.common import Configuration


class Settings(BaseModel):

    file_upload_url: str

    storage_account_name: str

    storage_account_key: str

    storage_connection_string: str

    monitoring_key: str

    @classmethod
    def from_configuration(cls, configuration: Configuration) -> "Settings":
        return cls(
            file_upload_url=configuration.file_upload_url,
            storage_account_name=configuration.storage_account_name,
            storage_account_key=configuration.storage_account_key,
            storage_connection_string=configuration.storage_connection_string,
            monitoring_key=configuration.monitoring_key,
        )
