from configuration.common import ConfigurationBuilder

from domain.settings import read_account_name_and_key


def test_read_account_name_and_key():
    builder = ConfigurationBuilder(
        {"storage_account_name": "foo", "storage_account_key": "***"}
    )

    config = builder.build()

    name, key = read_account_name_and_key(config)
    assert name == "foo"
    assert key == "***"


def test_read_account_name_and_key_using_conn_string():
    builder = ConfigurationBuilder(
        {"storage_account_connection_string": "AccountName=foo;AccountKey=***"}
    )

    config = builder.build()

    name, key = read_account_name_and_key(config)
    assert name == "foo"
    assert key == "***"
