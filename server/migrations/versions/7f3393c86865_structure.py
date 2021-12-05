"""structure

Revision ID: 7f3393c86865
Revises:
Create Date: 2021-12-04 22:42:17.312518

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "7f3393c86865"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "storages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("type", sa.String(length=50), nullable=True),
        sa.Column("key_secret_id", sa.String(length=200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "etag",
            sa.String(length=50),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.execute("CREATE UNIQUE INDEX ux_storage_name ON storages (lower(name))")

    # insert the default storage
    op.execute(
        """
        INSERT INTO storages (id, name, type, key_secret_id)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            'Default',
            'Azure Storage',
            ''
        )
        """
    )

    op.create_table(
        "albums",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("storage_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=True),
        sa.Column("public", sa.Boolean(), nullable=False),
        sa.Column("image_url", sa.String(length=2000), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "etag",
            sa.String(length=50),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["storage_id"], ["storages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_albums_storage_id"), "albums", ["storage_id"], unique=False
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_albums_name_ci ON albums (lower(name), storage_id);"
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_albums_slug_ci ON albums (lower(slug), storage_id);"
    )

    op.create_table(
        "nodes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("album_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("icon", sa.String(length=255), nullable=True),
        sa.Column("hidden", sa.Boolean(), nullable=False),
        sa.Column("folder", sa.Boolean(), nullable=False),
        sa.Column("file_id", sa.String(length=255), nullable=True),
        sa.Column("file_extension", sa.String(length=50), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("medium_image_name", sa.String(length=255), nullable=True),
        sa.Column("small_image_name", sa.String(length=255), nullable=True),
        sa.Column("image_width", sa.Integer(), nullable=True),
        sa.Column("image_height", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "etag",
            sa.String(length=50),
            server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["album_id"], ["albums.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["nodes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_nodes_album_id"), "nodes", ["album_id"], unique=False)
    op.create_index(op.f("ix_nodes_parent_id"), "nodes", ["parent_id"], unique=False)

    op.execute(
        "CREATE UNIQUE INDEX ix_no_parent_folder_combination_name ON "
        "nodes (album_id, lower(name), (parent_id IS NULL)) WHERE parent_id IS NULL;"
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_with_parent_folder_combination_name ON "
        "nodes (album_id, lower(name), parent_id) WHERE parent_id IS NOT NULL;"
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_no_parent_folder_combination_slug ON "
        "nodes (album_id, lower(slug), (parent_id IS NULL)) WHERE parent_id IS NULL;"
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_with_parent_folder_combination_slug ON "
        "nodes (album_id, lower(slug), parent_id) WHERE parent_id IS NOT NULL;"
    )


def downgrade():
    op.drop_index(op.f("ux_storage_name"), table_name="storages")

    for node_index in {
        "ix_nodes_parent_id",
        "ix_nodes_album_id",
        "ix_no_parent_folder_combination_name",
        "ix_no_parent_folder_combination_slug",
        "ix_with_parent_folder_combination_name",
        "ix_with_parent_folder_combination_slug",
    }:
        op.drop_index(op.f(node_index), table_name="nodes")

    op.drop_table("nodes")

    for album_index in {
        "ix_albums_storage_id",
        "ix_albums_name_ci",
        "ix_albums_slug_ci",
    }:
        op.drop_index(op.f(album_index), table_name="albums")

    op.drop_table("albums")
    op.drop_table("storages")
