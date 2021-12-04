from dataclasses import dataclass

from configuration.common import Configuration


@dataclass
class Settings:

    monitoring_key: str

    @classmethod
    def from_configuration(cls, configuration: Configuration) -> "Settings":
        return cls(
            monitoring_key=configuration.monitoring_key,
        )
