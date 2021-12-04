# Connecting to the PostgreSQL database
This page documents how to connect to a development instance of the PostgreSQL
database using pgAdmin with Docker. When developing web applications, it is
often useful to connect directly to the development environment database, for
example to inspect the shape of the database after running migrations.

Run an instance of pgAdmin, mapping the local port 8080 to the container's port
80 (change the local port as desired).

```bash
docker run -p 8080:80 \
  -e 'PGADMIN_DEFAULT_EMAIL=user@domain.com' \
  -e 'PGADMIN_DEFAULT_PASSWORD=SuperSecret' \
  -d dpage/pgadmin4
```

TODO: copy from
https://dev.azure.com/robertoprevato/Studies/_wiki/wikis/Studies.wiki?wikiVersion=GBwikiMaster&pagePath=/PostgreSQL/Azure PostgreSQL
