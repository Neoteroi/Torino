from functools import partial

from domain.logs import log_dep

log_blob_dep = partial(log_dep, "AzureStorageBlob")
log_table_dep = partial(log_dep, "AzureStorageTable")
