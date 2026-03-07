"""add_currency_master_and_property_currency

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2026-03-07 10:40:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "b7c8d9e0f1a2"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "currencies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("symbol", sa.String(length=10), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_currencies_id"), "currencies", ["id"], unique=False)

    op.execute(
        """
        INSERT INTO currencies (name, code, symbol, description)
        VALUES
          ('Ghana Cedi', 'GHS', 'GH₵', 'Ghanaian Cedi'),
          ('US Dollar', 'USD', '$', 'United States Dollar'),
          ('Euro', 'EUR', '€', 'Euro')
        ON CONFLICT (code) DO NOTHING
        """
    )

    op.add_column("properties", sa.Column("currency_id", sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE properties
        SET currency_id = (SELECT id FROM currencies WHERE code = 'GHS' LIMIT 1)
        WHERE currency_id IS NULL
        """
    )
    op.alter_column("properties", "currency_id", nullable=False)
    op.create_foreign_key(
        "fk_properties_currency_id_currencies",
        "properties",
        "currencies",
        ["currency_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_properties_currency_id", "properties", ["currency_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_properties_currency_id", table_name="properties")
    op.drop_constraint("fk_properties_currency_id_currencies", "properties", type_="foreignkey")
    op.drop_column("properties", "currency_id")

    op.drop_index(op.f("ix_currencies_id"), table_name="currencies")
    op.drop_table("currencies")
