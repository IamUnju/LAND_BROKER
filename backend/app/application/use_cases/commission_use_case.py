from fastapi import HTTPException, status
from typing import Optional
from app.domain.repositories.i_commission_repository import ICommissionRepository
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.services.commission_service import CommissionDomainService
from app.domain.entities.commission import Commission
from app.application.dto.business_dto import CommissionCreateDTO


class CommissionUseCase:
    def __init__(
        self,
        commission_repo: ICommissionRepository,
        property_repo: IPropertyRepository,
        user_repo: IUserRepository,
    ):
        self._repo = commission_repo
        self._property_repo = property_repo
        self._user_repo = user_repo

    async def create_commission(self, dto: CommissionCreateDTO) -> Commission:
        prop = await self._property_repo.get_by_id(dto.property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        commission = CommissionDomainService.create_commission(
            property_id=dto.property_id,
            broker_id=dto.broker_id,
            transaction_amount=dto.transaction_amount,
            commission_rate=dto.commission_rate,
            notes=dto.notes,
        )
        return await self._repo.create(commission)

    async def get_commission(self, commission_id: int) -> Commission:
        commission = await self._repo.get_by_id(commission_id)
        if not commission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commission not found")
        return commission

    async def get_broker_commissions(self, broker_id: int):
        return await self._repo.get_by_broker(broker_id)

    async def get_property_commissions(self, property_id: int):
        return await self._repo.get_by_property(property_id)

    async def list_commissions(
        self,
        skip: int = 0,
        limit: int = 100,
        property_id: Optional[int] = None,
        broker_id: Optional[int] = None,
        status: Optional[str] = None,
    ):
        commissions = await self._repo.get_all(skip=skip, limit=limit)
        
        # Apply filters if provided
        if property_id is not None:
            commissions = [c for c in commissions if c.property_id == property_id]
        if broker_id is not None:
            commissions = [c for c in commissions if c.broker_id == broker_id]
        if status:
            commissions = [c for c in commissions if c.status.value == status]
        
        # Enrich with property and broker names
        for commission in commissions:
            try:
                prop = await self._property_repo.get_by_id(commission.property_id)
                commission.property_title = prop.title if prop else None
            except:
                commission.property_title = None
            
            try:
                broker = await self._user_repo.get_by_id(commission.broker_id)
                if broker:
                    commission.broker_name = f"{broker.first_name} {broker.last_name}".strip()
            except:
                commission.broker_name = None
        
        return commissions

    async def mark_paid(self, commission_id: int) -> Commission:
        commission = await self.get_commission(commission_id)
        commission.mark_paid()
        return await self._repo.update(commission)

    async def cancel_commission(self, commission_id: int) -> Commission:
        commission = await self.get_commission(commission_id)
        commission.cancel()
        return await self._repo.update(commission)

    async def delete_commission(self, commission_id: int) -> bool:
        await self.get_commission(commission_id)
        return await self._repo.delete(commission_id)
