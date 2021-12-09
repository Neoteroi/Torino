import re
from typing import Iterable, Tuple


def split_pairs_eqsc(value: str) -> Iterable[Tuple[str, str]]:
    """
    Splits values in the form of: "key1=value1; key2=value2;" into key-value pairs.
    """
    for match in re.finditer(r"([^\=]+)=([^\;]+);?", value):
        key, value = match.groups()
        yield key, value
