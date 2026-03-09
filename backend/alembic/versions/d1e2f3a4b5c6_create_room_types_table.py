"""create_room_types_table

Revision ID: d1e2f3a4b5c6
Revises: c9d0e1f2a3b4
Create Date: 2026-03-09 10:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, None] = "c9d0e1f2a3b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "room_types",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_room_types_id"), "room_types", ["id"], unique=False)

    # Insert initial room types
    op.execute(
        """
        INSERT INTO room_types (name, description)
        VALUES
          ('Single Room', 'A single room for one person'),
          ('Double Room', 'A double room for two people sharing'),
          ('Single Self', 'Self-contained single room with private facilities'),
          ('Double Self', 'Self-contained double room with private facilities')
        ON CONFLICT (name) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_room_types_id"), table_name="room_types")
    op.drop_table("room_types")
