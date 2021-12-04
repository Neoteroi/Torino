# Alembic

This application uses `Alembic` to handle database migrations with [code-first
approach](https://alembic.sqlalchemy.org/en/latest/autogenerate.html), and the
ORM solution provided by `SQLAlchemy`.

References:
[See the documentation](https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-migration-script).
[SQLAlchemy 1.4 / 2.0 Tutorial](https://docs.sqlalchemy.org/en/14/tutorial/index.html).

## Quick reference

Create a revision, for example because a change was introduced in the DB model
in code:

```bash
alembic revision --autogenerate -m "Added account table"

# review and configure the migration as desired...

# apply a migration using the CLI (requires connection string configured in alembic.ini)
alembic upgrade head

# see history
alembic history --verbose

alembic current
```

To revert to the beginning:

```bash
alembic downgrade base
```
