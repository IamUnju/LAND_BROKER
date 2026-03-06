"""
Quick script to update admin credentials in production database
"""
import asyncio
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
            admin.email = "kennyngoe@gmail.com"
            admin.first_name = "Ngoe"
            admin.last_name = "Admin"
            admin.hashed_password = hasher.hash("Ngoe@123")
            await session.commit()
            print("✅ Admin user updated successfully!")
            print(f"   Email: {admin.email}")
            print(f"   Name: {admin.first_name} {admin.last_name}")
        else:
            print("⚠️  Admin user not found")


if __name__ == "__main__":
    asyncio.run(update_admin())
