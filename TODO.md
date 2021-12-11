## TODO???

Torino also provides the following persistence layers for the metadata that is necessary to
handle the virtual file system:

| Persistence layer             | Description | Use case |
| ----------------------------- | ----------- | -------- |
| **Storage Account Table API** | ...         |          |
| **SQLite**                    | ...         |          |
| **PostgreSQL**                | ...         |          |

# come persistere SQLite sull'host?
https://docs.docker.com/storage/

# come è fatto con PostgreSQL?

# supportare Azure Storage Table API? - questo ha senso, però non offre supporto per Search o Count!

# usare async API per Python?

# arch diagram, components


If you don`t trust the image published by me on Docker Hub (which is a good
mindset, since the Docker image handles a private storage account key), you
can verify reading the source code, that nothing  fishy
with your storage account key, then create a new image using the following command:

```bash
docker build -t torino .
```

**Important**:

Otherwise, it is necessary to clone the repository, prepare a Python virtual
environment, build the single page application using `yarn`.


If you don`t trust the image published by me on Docker Hub (which is a good
mindset, since the Docker image handles a private storage account key), you
can:
* verify that nothing fishy happens to the key, inspecting the source code and
  the app running locally
* create and run a new Docker image
