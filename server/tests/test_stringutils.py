import pytest
from core.stringutils import split_pairs_eqsc


@pytest.mark.parametrize(
    "value,expected_results",
    [
        ["A=1;B=2", [("A", "1"), ("B", "2")]],
        ["A=1;B=2;", [("A", "1"), ("B", "2")]],
        ["A=1;B=2;C=3", [("A", "1"), ("B", "2"), ("C", "3")]],
        [
            "DefaultEndpointsProtocol=https;AccountName=foo;AccountKey=****;",
            [
                ("DefaultEndpointsProtocol", "https"),
                ("AccountName", "foo"),
                ("AccountKey", "****"),
            ],
        ],
    ],
)
def test_split_pairs_eqsc(value, expected_results):
    results = list(split_pairs_eqsc(value))
    assert results == expected_results
