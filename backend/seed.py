"""
Seed script: initializes master data and creates test users.

Usage:
    python seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.database import AsyncSessionLocal
from app.infrastructure.db.models import (
    RoleModel, PropertyTypeModel, ListingTypeModel, RegionModel, DistrictModel, UserModel,
)
from app.infrastructure.security.password import PasswordHasher


async def seed():
    async with AsyncSessionLocal() as session:
        await seed_roles(session)
        await seed_property_types(session)
        await seed_listing_types(session)
        await seed_regions_districts(session)
        await seed_users(session)
        await session.commit()
        print("\n✅ Seed data inserted successfully!")
        print("\nTest Credentials:")
        print("─" * 40)
        print("ADMIN   → admin@broker.com     / Admin@1234")
        print("OWNER   → owner@broker.com     / Owner@1234")
        print("TENANT  → tenant@broker.com    / Tenant@1234")
        print("BROKER  → broker@broker.com    / Broker@1234")
        print("─" * 40)


async def seed_roles(session: AsyncSession):
    roles = [
        {"name": "ADMIN", "description": "System administrator with full access"},
        {"name": "OWNER", "description": "Property owner / landlord"},
        {"name": "TENANT", "description": "Property tenant"},
        {"name": "BROKER", "description": "Real estate broker / agent"},
    ]
    for r in roles:
        exists = await session.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(RoleModel).where(RoleModel.name == r["name"])
        )
        if not exists.scalar_one_or_none():
            session.add(RoleModel(**r))
            print(f"  ✓ Role: {r['name']}")
    await session.flush()


async def seed_property_types(session: AsyncSession):
    types = [
        {"name": "Apartment", "description": "Residential apartment unit"},
        {"name": "House", "description": "Standalone residential house"},
        {"name": "Villa", "description": "Luxury villa property"},
        {"name": "Office", "description": "Commercial office space"},
        {"name": "Shop", "description": "Retail shop space"},
        {"name": "Warehouse", "description": "Storage and industrial space"},
        {"name": "Land", "description": "Undeveloped land plot"},
    ]
    from sqlalchemy import select
    for t in types:
        exists = await session.execute(select(PropertyTypeModel).where(PropertyTypeModel.name == t["name"]))
        if not exists.scalar_one_or_none():
            session.add(PropertyTypeModel(**t))
            print(f"  ✓ PropertyType: {t['name']}")
    await session.flush()


async def seed_listing_types(session: AsyncSession):
    from sqlalchemy import select
    types = [
        {"name": "FOR_RENT", "description": "Available for rental"},
        {"name": "FOR_SALE", "description": "Available for purchase"},
        {"name": "BOTH", "description": "Available for rent or sale"},
    ]
    for t in types:
        exists = await session.execute(select(ListingTypeModel).where(ListingTypeModel.name == t["name"]))
        if not exists.scalar_one_or_none():
            session.add(ListingTypeModel(**t))
            print(f"  ✓ ListingType: {t['name']}")
    await session.flush()


async def seed_regions_districts(session: AsyncSession):
    from sqlalchemy import select
    regions_data = {
        "Greater Accra": ["Accra Central", "Tema", "East Legon", "Cantonments", "Osu", "Spintex"],
        "Ashanti": ["Kumasi Central", "Nhyiaeso", "Bantama", "Suame"],
        "Western": ["Takoradi", "Sekondi", "Tarkwa"],
        "Eastern": ["Koforidua", "Nkawkaw", "Mpraeso"],
        "Northern": ["Tamale Central", "Sagnarigu", "Tolon"],
    }
    for region_name, districts in regions_data.items():
        r_exists = await session.execute(select(RegionModel).where(RegionModel.name == region_name))
        region = r_exists.scalar_one_or_none()
        if not region:
            region = RegionModel(name=region_name)
            session.add(region)
            await session.flush()
            print(f"  ✓ Region: {region_name}")

        for d_name in districts:
            d_exists = await session.execute(
                select(DistrictModel).where(
                    DistrictModel.name == d_name, DistrictModel.region_id == region.id
                )
            )
            if not d_exists.scalar_one_or_none():
                session.add(DistrictModel(name=d_name, region_id=region.id))
    await session.flush()


async def seed_users(session: AsyncSession):
    from sqlalchemy import select
    hasher = PasswordHasher()

    # Get role IDs
    roles = {}
    for name in ["ADMIN", "OWNER", "TENANT", "BROKER"]:
        r = await session.execute(select(RoleModel).where(RoleModel.name == name))
        role = r.scalar_one_or_none()
        if role:
            roles[name] = role.id

    users = [
        {"email": "admin@broker.com", "password": "Admin@1234", "first_name": "System", "last_name": "Admin", "role": "ADMIN"},
        {"email": "owner@broker.com", "password": "Owner@1234", "first_name": "John", "last_name": "Owner", "role": "OWNER"},
        {"email": "tenant@broker.com", "password": "Tenant@1234", "first_name": "Jane", "last_name": "Tenant", "role": "TENANT"},
        {"email": "broker@broker.com", "password": "Broker@1234", "first_name": "Bob", "last_name": "Broker", "role": "BROKER"},
    ]

    for u in users:
        exists = await session.execute(select(UserModel).where(UserModel.email == u["email"]))
        if not exists.scalar_one_or_none():
            role_id = roles.get(u["role"])
            if role_id:
                session.add(UserModel(
                    email=u["email"],
                    hashed_password=hasher.hash(u["password"]),
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    role_id=role_id,
                    is_active=True,
                    is_verified=True,
                ))
                print(f"  ✓ User: {u['email']} ({u['role']})")
    await session.flush()


if __name__ == "__main__":
    asyncio.run(seed())
