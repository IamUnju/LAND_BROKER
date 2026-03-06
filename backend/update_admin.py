"""
Quick script to update admin credentials in production database
Run this once after deployment: python update_admin.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.infrastructure.db.database import AsyncSessionLocal
from app.infrastructure.db.models import UserModel
from app.infrastructure.security.password import PasswordHasher
from sqlalchemy import select


async def update_admin():
    hasher = PasswordHasher()
    async with AsyncSessionLocal() as session:
        # Find admin user by old email
        result = await session.execute(
            select(UserModel).where(UserModel.email == "admin@broker.com")
        )
        admin = result.scalar_one_or_none()
        
        if admin:
            print(f"📝 Updating admin user from {admin.email}...")
            admin.email = "kennyngoe@gmail.com"
            admin.first_name = "Ngoe"
            admin.last_name = "Admin"
            admin.hashed_password = hasher.hash("Ngoe@123")
            await session.commit()
            print("✅ Admin user updated successfully!")
            print(f"   Email: {admin.email}")
            print(f"   Name: {admin.first_name} {admin.last_name}")
            print(f"   Password: Ngoe@123")
        else:
            # Check if new admin already exists
            result = await session.execute(
                select(UserModel).where(UserModel.email == "kennyngoe@gmail.com")
            )
            new_admin = result.scalar_one_or_none()
            if new_admin:
                print("✅ Admin user already updated!")
                print(f"   Email: {new_admin.email}")
                print(f"   Name: {new_admin.first_name} {new_admin.last_name}")
            else:
                print("⚠️  Admin user not found with either email")


if __name__ == "__main__":
    print("=" * 50)
    print("  Admin Credentials Update Script")
    print("=" * 50)
    asyncio.run(update_admin())
    print("=" * 50)
