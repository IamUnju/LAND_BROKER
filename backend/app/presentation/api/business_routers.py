from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.application.dto.business_dto import (
    TenantCreateDTO, TenantUpdateDTO, TenantResponseDTO,
    LeaseCreateDTO, LeaseUpdateDTO, LeaseResponseDTO,
    PaymentCreateDTO, PaymentMarkPaidDTO, PaymentResponseDTO,
    MaintenanceCreateDTO, MaintenanceUpdateDTO, MaintenanceResponseDTO,
    InquiryCreateDTO, InquiryRespondDTO, InquiryResponseDTO,
    FavoriteResponseDTO,
    CommissionCreateDTO, CommissionResponseDTO,
)
from app.application.use_cases.tenant_use_case import TenantUseCase
from app.application.use_cases.lease_use_case import LeaseUseCase
from app.application.use_cases.payment_use_case import PaymentUseCase
from app.application.use_cases.maintenance_use_case import MaintenanceUseCase
from app.application.use_cases.inquiry_use_case import InquiryUseCase, FavoriteUseCase
from app.application.use_cases.commission_use_case import CommissionUseCase
from app.presentation.dependencies.di_container import (
    get_tenant_use_case, get_lease_use_case, get_payment_use_case,
    get_maintenance_use_case, get_inquiry_use_case, get_favorite_use_case,
    get_commission_use_case, get_current_user, require_roles,
)
from app.domain.entities.user import User


# ─── Tenant Router ─────────────────────────────────────────────────────────────
tenant_router = APIRouter(prefix="/tenants", tags=["Tenants"])


@tenant_router.post("/", response_model=TenantResponseDTO, status_code=201)
async def create_tenant(
    dto: TenantCreateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.create_tenant(dto)


@tenant_router.get("/", response_model=List[TenantResponseDTO])
async def list_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.list_tenants(skip=skip, limit=limit)


@tenant_router.get("/me", response_model=TenantResponseDTO)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.get_tenant_by_user(current_user.id)


@tenant_router.get("/{tenant_id}", response_model=TenantResponseDTO)
async def get_tenant(
    tenant_id: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.get_tenant(tenant_id)


@tenant_router.put("/{tenant_id}", response_model=TenantResponseDTO)
async def update_tenant(
    tenant_id: int,
    dto: TenantUpdateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.update_tenant(tenant_id, dto)


@tenant_router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(
    tenant_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    await use_case.delete_tenant(tenant_id)


@tenant_router.patch("/{tenant_id}/blacklist", response_model=TenantResponseDTO)
async def blacklist_tenant(
    tenant_id: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: TenantUseCase = Depends(get_tenant_use_case),
):
    return await use_case.blacklist_tenant(tenant_id)


# ─── Lease Router ────────────────────────────────────────────────────────────
lease_router = APIRouter(prefix="/leases", tags=["Leases"])


@lease_router.post("/", response_model=LeaseResponseDTO, status_code=201)
async def create_lease(
    dto: LeaseCreateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.create_lease(dto)


@lease_router.get("/my", response_model=List[LeaseResponseDTO])
async def get_my_leases(
    current_user: User = Depends(get_current_user),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    """Returns leases for the current tenant (by user_id)."""
    return await use_case.get_leases_by_user(current_user.id)


@lease_router.get("/", response_model=List[LeaseResponseDTO])
async def list_leases(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_user),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.list_leases(skip=skip, limit=limit)


@lease_router.get("/{lease_id}", response_model=LeaseResponseDTO)
async def get_lease(
    lease_id: int,
    _: User = Depends(get_current_user),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.get_lease(lease_id)


@lease_router.put("/{lease_id}", response_model=LeaseResponseDTO)
async def update_lease(
    lease_id: int,
    dto: LeaseUpdateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.update_lease(lease_id, dto)


@lease_router.patch("/{lease_id}/activate", response_model=LeaseResponseDTO)
async def activate_lease(
    lease_id: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.activate_lease(lease_id)


@lease_router.patch("/{lease_id}/terminate", response_model=LeaseResponseDTO)
async def terminate_lease(
    lease_id: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.terminate_lease(lease_id)


@lease_router.get("/tenant/{tenant_id}", response_model=List[LeaseResponseDTO])
async def get_tenant_leases(
    tenant_id: int,
    _: User = Depends(get_current_user),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    return await use_case.get_tenant_leases(tenant_id)


@lease_router.delete("/{lease_id}", status_code=204)
async def delete_lease(
    lease_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: LeaseUseCase = Depends(get_lease_use_case),
):
    await use_case.delete_lease(lease_id)


# ─── Payment Router ───────────────────────────────────────────────────────────
payment_router = APIRouter(prefix="/payments", tags=["Payments"])


@payment_router.post("/", response_model=PaymentResponseDTO, status_code=201)
async def create_payment(
    dto: PaymentCreateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.create_payment(dto)


@payment_router.post("/generate/{lease_id}", response_model=List[PaymentResponseDTO])
async def generate_payments(
    lease_id: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.generate_lease_payments(lease_id)


@payment_router.get("/", response_model=List[PaymentResponseDTO])
async def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_user),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.list_payments(skip=skip, limit=limit)


@payment_router.get("/lease/{lease_id}", response_model=List[PaymentResponseDTO])
async def get_lease_payments(
    lease_id: int,
    _: User = Depends(get_current_user),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.get_lease_payments(lease_id)


@payment_router.get("/balance/{lease_id}")
async def get_outstanding_balance(
    lease_id: int,
    _: User = Depends(get_current_user),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.get_outstanding_balance(lease_id)


@payment_router.get("/report/monthly")
async def monthly_report(
    year: int,
    month: int,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.get_monthly_report(year, month)


@payment_router.get("/{payment_id}", response_model=PaymentResponseDTO)
async def get_payment(
    payment_id: int,
    _: User = Depends(get_current_user),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.get_payment(payment_id)


@payment_router.patch("/{payment_id}/pay", response_model=PaymentResponseDTO)
async def mark_payment_paid(
    payment_id: int,
    dto: PaymentMarkPaidDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.mark_paid(payment_id, dto)


@payment_router.patch("/{payment_id}/overdue", response_model=PaymentResponseDTO)
async def mark_payment_overdue(
    payment_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    return await use_case.mark_overdue(payment_id)


@payment_router.delete("/{payment_id}", status_code=204)
async def delete_payment(
    payment_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: PaymentUseCase = Depends(get_payment_use_case),
):
    await use_case.delete_payment(payment_id)


# ─── Maintenance Router ────────────────────────────────────────────────────────
maintenance_router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@maintenance_router.post("/", response_model=MaintenanceResponseDTO, status_code=201)
async def create_request(
    dto: MaintenanceCreateDTO,
    current_user: User = Depends(require_roles("TENANT")),
    use_case: MaintenanceUseCase = Depends(get_maintenance_use_case),
):
    return await use_case.create_request(dto, user_id=current_user.id)


@maintenance_router.get("/", response_model=List[MaintenanceResponseDTO])
async def list_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_user),
    use_case: MaintenanceUseCase = Depends(get_maintenance_use_case),
):
    return await use_case.list_requests(skip=skip, limit=limit)


@maintenance_router.get("/{request_id}", response_model=MaintenanceResponseDTO)
async def get_request(
    request_id: int,
    _: User = Depends(get_current_user),
    use_case: MaintenanceUseCase = Depends(get_maintenance_use_case),
):
    return await use_case.get_request(request_id)


@maintenance_router.put("/{request_id}", response_model=MaintenanceResponseDTO)
async def update_request(
    request_id: int,
    dto: MaintenanceUpdateDTO,
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: MaintenanceUseCase = Depends(get_maintenance_use_case),
):
    return await use_case.update_request(request_id, dto)


@maintenance_router.delete("/{request_id}", status_code=204)
async def delete_request(
    request_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MaintenanceUseCase = Depends(get_maintenance_use_case),
):
    await use_case.delete_request(request_id)


# ─── Inquiry Router ────────────────────────────────────────────────────────────
inquiry_router = APIRouter(prefix="/inquiries", tags=["Inquiries"])


@inquiry_router.post("/", response_model=InquiryResponseDTO, status_code=201)
async def create_inquiry(
    dto: InquiryCreateDTO,
    current_user: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.create_inquiry(dto, user_id=current_user.id)


@inquiry_router.get("/my", response_model=List[InquiryResponseDTO])
async def my_inquiries(
    current_user: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.get_user_inquiries(current_user.id)


@inquiry_router.get("/property/{property_id}", response_model=List[InquiryResponseDTO])
async def property_inquiries(
    property_id: int,
    current_user: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.get_property_inquiries(
        property_id,
        actor_user_id=current_user.id,
        actor_role=current_user.role_name,
    )


@inquiry_router.get("/assigned", response_model=List[InquiryResponseDTO])
async def assigned_inquiries(
    current_user: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.get_assigned_inquiries(
        actor_user_id=current_user.id,
        actor_role=current_user.role_name,
    )


@inquiry_router.get("/", response_model=List[InquiryResponseDTO])
async def list_inquiries(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_roles("ADMIN")),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.list_inquiries(skip=skip, limit=limit)


@inquiry_router.get("/{inquiry_id}", response_model=InquiryResponseDTO)
async def get_inquiry(
    inquiry_id: int,
    _: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.get_inquiry(inquiry_id)


@inquiry_router.patch("/{inquiry_id}/respond", response_model=InquiryResponseDTO)
async def respond_to_inquiry(
    inquiry_id: int,
    dto: InquiryRespondDTO,
    current_user: User = Depends(get_current_user),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    return await use_case.respond_to_inquiry(
        inquiry_id,
        dto,
        actor_user_id=current_user.id,
        actor_role=current_user.role_name,
    )


@inquiry_router.delete("/{inquiry_id}", status_code=204)
async def delete_inquiry(
    inquiry_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: InquiryUseCase = Depends(get_inquiry_use_case),
):
    await use_case.delete_inquiry(inquiry_id)


# ─── Favorites Router ──────────────────────────────────────────────────────────
favorites_router = APIRouter(prefix="/favorites", tags=["Favorites"])


@favorites_router.post("/{property_id}", response_model=FavoriteResponseDTO, status_code=201)
async def add_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    use_case: FavoriteUseCase = Depends(get_favorite_use_case),
):
    return await use_case.add_favorite(current_user.id, property_id)


@favorites_router.delete("/{property_id}", status_code=204)
async def remove_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    use_case: FavoriteUseCase = Depends(get_favorite_use_case),
):
    await use_case.remove_favorite(current_user.id, property_id)


@favorites_router.get("/", response_model=List[FavoriteResponseDTO])
async def my_favorites(
    current_user: User = Depends(get_current_user),
    use_case: FavoriteUseCase = Depends(get_favorite_use_case),
):
    return await use_case.get_user_favorites(current_user.id)


# ─── Commission Router ────────────────────────────────────────────────────────
commission_router = APIRouter(prefix="/commissions", tags=["Commissions"])


@commission_router.post("", response_model=CommissionResponseDTO, status_code=201)
async def create_commission(
    dto: CommissionCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    return await use_case.create_commission(dto)


@commission_router.get("", response_model=List[CommissionResponseDTO])
async def list_commissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    property_id: Optional[int] = Query(None),
    broker_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    _: User = Depends(require_roles("ADMIN")),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    return await use_case.list_commissions(
        skip=skip,
        limit=limit,
        property_id=property_id,
        broker_id=broker_id,
        status=status,
    )


@commission_router.get("/broker/{broker_id}", response_model=List[CommissionResponseDTO])
async def broker_commissions(
    broker_id: int,
    current_user: User = Depends(get_current_user),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    return await use_case.get_broker_commissions(broker_id)


@commission_router.get("/{commission_id}", response_model=CommissionResponseDTO)
async def get_commission(
    commission_id: int,
    _: User = Depends(get_current_user),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    return await use_case.get_commission(commission_id)


@commission_router.patch("/{commission_id}/pay", response_model=CommissionResponseDTO)
async def pay_commission(
    commission_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    return await use_case.mark_paid(commission_id)


@commission_router.delete("/{commission_id}", status_code=204)
async def delete_commission(
    commission_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: CommissionUseCase = Depends(get_commission_use_case),
):
    await use_case.delete_commission(commission_id)
