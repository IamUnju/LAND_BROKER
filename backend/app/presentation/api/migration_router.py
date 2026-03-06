"""
One-time admin update endpoint
Visit /api/v1/admin/migrate-credentials to trigger the update
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from app.infrastructure.db.database import AsyncSessionLocal
from app.infrastructure.db.models import UserModel
from app.infrastructure.security.password import PasswordHasher

router = APIRouter(prefix="/admin", tags=["admin-migration"])


@router.post("/migrate-credentials")
async def migrate_admin_credentials():
    """
    ONE-TIME MIGRATION ENDPOINT
    Updates admin@broker.com to kennyngoe@gmail.com with new credentials
    Remove this endpoint after successful migration
    """
    hasher = PasswordHasher()
    async with AsyncSessionLocal() as session:
        # Check if old admin exists
        result = await session.execute(
            select(UserModel).where(UserModel.email == "admin@broker.com")
        )
        old_admin = result.scalar_one_or_none()
        
        if old_admin:
            # Update to new credentials
            old_admin.email = "kennyngoe@gmail.com"
            old_admin.first_name = "Ngoe"
            old_admin.last_name = "Admin"
            old_admin.hashed_password = hasher.hash("Ngoe@123")
            await session.commit()
            
            return {
                "status": "success",
                "message": "Admin credentials updated successfully",
                "admin": {
                    "email": old_admin.email,
                    "first_name": old_admin.first_name,
                    "last_name": old_admin.last_name
                }
            }
        
        # Check if new admin already exists
        result = await session.execute(
            select(UserModel).where(UserModel.email == "kennyngoe@gmail.com")
        )
        new_admin = result.scalar_one_or_none()
        
        if new_admin:
            return {
                "status": "already_migrated",
                "message": "Admin credentials already updated",
                "admin": {
                    "email": new_admin.email,
                    "first_name": new_admin.first_name,
                    "last_name": new_admin.last_name
                }
            }
        
        return {
            "status": "error",
            "message": "No admin user found with either email address"
        }
