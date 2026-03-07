from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.infrastructure.db.database import get_db
from app.infrastructure.security.jwt import JWTService
from app.infrastructure.security.password import PasswordHasher
from app.infrastructure.repositories.user_repository import UserRepository
from app.infrastructure.repositories.property_repository import PropertyRepository
from app.infrastructure.repositories.unit_repository import UnitRepository
from app.infrastructure.repositories.tenant_repository import TenantRepository
from app.infrastructure.repositories.lease_repository import LeaseRepository
from app.infrastructure.repositories.payment_repository import PaymentRepository
from app.infrastructure.repositories.maintenance_repository import MaintenanceRepository
from app.infrastructure.repositories.inquiry_repository import InquiryRepository, FavoriteRepository
from app.infrastructure.repositories.commission_repository import CommissionRepository
from app.infrastructure.repositories.master_repositories import (
    RoleRepository, PropertyTypeRepository, ListingTypeRepository,
    RegionRepository, DistrictRepository, CurrencyRepository,
)
from app.application.use_cases.auth_use_case import AuthUseCase
from app.application.use_cases.user_use_case import UserUseCase
from app.application.use_cases.property_use_case import PropertyUseCase
from app.application.use_cases.unit_use_case import UnitUseCase
from app.application.use_cases.tenant_use_case import TenantUseCase
from app.application.use_cases.lease_use_case import LeaseUseCase
from app.application.use_cases.payment_use_case import PaymentUseCase
from app.application.use_cases.maintenance_use_case import MaintenanceUseCase
from app.application.use_cases.inquiry_use_case import InquiryUseCase, FavoriteUseCase
from app.application.use_cases.commission_use_case import CommissionUseCase
from app.application.use_cases.master_use_case import MasterUseCase
from app.domain.entities.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
jwt_service = JWTService()
password_hasher = PasswordHasher()


# ── Repository Factories ─────────────────────────────────────────────────────
def get_user_repo(db: AsyncSession = Depends(get_db)):
    return UserRepository(db)

def get_property_repo(db: AsyncSession = Depends(get_db)):
    return PropertyRepository(db)

def get_unit_repo(db: AsyncSession = Depends(get_db)):
    return UnitRepository(db)

def get_tenant_repo(db: AsyncSession = Depends(get_db)):
    return TenantRepository(db)

def get_lease_repo(db: AsyncSession = Depends(get_db)):
    return LeaseRepository(db)

def get_payment_repo(db: AsyncSession = Depends(get_db)):
    return PaymentRepository(db)

def get_maintenance_repo(db: AsyncSession = Depends(get_db)):
    return MaintenanceRepository(db)

def get_inquiry_repo(db: AsyncSession = Depends(get_db)):
    return InquiryRepository(db)

def get_favorite_repo(db: AsyncSession = Depends(get_db)):
    return FavoriteRepository(db)

def get_commission_repo(db: AsyncSession = Depends(get_db)):
    return CommissionRepository(db)

def get_role_repo(db: AsyncSession = Depends(get_db)):
    return RoleRepository(db)

def get_property_type_repo(db: AsyncSession = Depends(get_db)):
    return PropertyTypeRepository(db)

def get_listing_type_repo(db: AsyncSession = Depends(get_db)):
    return ListingTypeRepository(db)

def get_region_repo(db: AsyncSession = Depends(get_db)):
    return RegionRepository(db)

def get_district_repo(db: AsyncSession = Depends(get_db)):
    return DistrictRepository(db)

def get_currency_repo(db: AsyncSession = Depends(get_db)):
    return CurrencyRepository(db)


# ── Use Case Factories ────────────────────────────────────────────────────────
def get_auth_use_case(
    user_repo=Depends(get_user_repo),
    role_repo=Depends(get_role_repo),
) -> AuthUseCase:
    return AuthUseCase(user_repo, password_hasher, jwt_service, role_repo)

def get_user_use_case(user_repo=Depends(get_user_repo)) -> UserUseCase:
    return UserUseCase(user_repo, password_hasher)

def get_property_use_case(property_repo=Depends(get_property_repo)) -> PropertyUseCase:
    return PropertyUseCase(property_repo)

def get_unit_use_case(
    unit_repo=Depends(get_unit_repo),
    property_repo=Depends(get_property_repo),
) -> UnitUseCase:
    return UnitUseCase(unit_repo, property_repo)

def get_tenant_use_case(
    tenant_repo=Depends(get_tenant_repo),
    user_repo=Depends(get_user_repo),
) -> TenantUseCase:
    return TenantUseCase(tenant_repo, user_repo)

def get_lease_use_case(
    lease_repo=Depends(get_lease_repo),
    unit_repo=Depends(get_unit_repo),
    tenant_repo=Depends(get_tenant_repo),
) -> LeaseUseCase:
    return LeaseUseCase(lease_repo, unit_repo, tenant_repo)

def get_payment_use_case(
    payment_repo=Depends(get_payment_repo),
    lease_repo=Depends(get_lease_repo),
) -> PaymentUseCase:
    return PaymentUseCase(payment_repo, lease_repo)

def get_maintenance_use_case(
    maintenance_repo=Depends(get_maintenance_repo),
    unit_repo=Depends(get_unit_repo),
    tenant_repo=Depends(get_tenant_repo),
) -> MaintenanceUseCase:
    return MaintenanceUseCase(maintenance_repo, unit_repo, tenant_repo)

def get_inquiry_use_case(
    inquiry_repo=Depends(get_inquiry_repo),
    property_repo=Depends(get_property_repo),
) -> InquiryUseCase:
    return InquiryUseCase(inquiry_repo, property_repo)

def get_favorite_use_case(
    favorite_repo=Depends(get_favorite_repo),
    property_repo=Depends(get_property_repo),
) -> FavoriteUseCase:
    return FavoriteUseCase(favorite_repo, property_repo)

def get_commission_use_case(
    commission_repo=Depends(get_commission_repo),
    property_repo=Depends(get_property_repo),
) -> CommissionUseCase:
    return CommissionUseCase(commission_repo, property_repo)

def get_master_use_case(
    role_repo=Depends(get_role_repo),
    property_type_repo=Depends(get_property_type_repo),
    listing_type_repo=Depends(get_listing_type_repo),
    region_repo=Depends(get_region_repo),
    district_repo=Depends(get_district_repo),
    currency_repo=Depends(get_currency_repo),
) -> MasterUseCase:
    return MasterUseCase(role_repo, property_type_repo, listing_type_repo, region_repo, district_repo, currency_repo)


# ── Auth Guards ────────────────────────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo=Depends(get_user_repo),
) -> User:
    payload = jwt_service.decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user_id = int(payload.get("sub"))
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    return user


def require_roles(*role_names: str):
    """Returns a dependency that enforces role-based access."""
    async def checker(current_user: User = Depends(get_current_user), role_repo=Depends(get_role_repo)) -> User:
        role = await role_repo.get_by_id(current_user.role_id)
        if not role or role.name not in [r.upper() for r in role_names]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access requires one of: {list(role_names)}",
            )
        return current_user
    return checker
