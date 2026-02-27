from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.repositories.i_unit_repository import IUnitRepository
from app.domain.repositories.i_tenant_repository import ITenantRepository
from app.domain.repositories.i_lease_repository import ILeaseRepository
from app.domain.repositories.i_payment_repository import IPaymentRepository
from app.domain.repositories.i_maintenance_repository import IMaintenanceRepository
from app.domain.repositories.i_inquiry_repository import IInquiryRepository, IFavoriteRepository
from app.domain.repositories.i_commission_repository import ICommissionRepository
from app.domain.repositories.i_master_repositories import (
    IRoleRepository,
    IPropertyTypeRepository,
    IListingTypeRepository,
    IRegionRepository,
    IDistrictRepository,
)

__all__ = [
    "IUserRepository",
    "IPropertyRepository",
    "IUnitRepository",
    "ITenantRepository",
    "ILeaseRepository",
    "IPaymentRepository",
    "IMaintenanceRepository",
    "IInquiryRepository",
    "IFavoriteRepository",
    "ICommissionRepository",
    "IRoleRepository",
    "IPropertyTypeRepository",
    "IListingTypeRepository",
    "IRegionRepository",
    "IDistrictRepository",
]
