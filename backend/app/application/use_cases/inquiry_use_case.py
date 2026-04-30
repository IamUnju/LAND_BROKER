import logging
from fastapi import HTTPException, status
from app.domain.repositories.i_inquiry_repository import IInquiryRepository, IFavoriteRepository
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.entities.inquiry import Inquiry, Favorite
from app.application.dto.business_dto import InquiryCreateDTO, InquiryRespondDTO
from app.infrastructure.services.email_service import EmailService

logger = logging.getLogger(__name__)


class InquiryUseCase:
    def __init__(
        self,
        inquiry_repo: IInquiryRepository,
        property_repo: IPropertyRepository,
        user_repo: IUserRepository,
        email_service: EmailService,
    ):
        self._repo = inquiry_repo
        self._property_repo = property_repo
        self._user_repo = user_repo
        self._email_service = email_service

    async def create_inquiry(self, dto: InquiryCreateDTO, user_id: int) -> Inquiry:
        prop = await self._property_repo.get_by_id(dto.property_id)
        if not prop or not prop.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        inquiry = Inquiry(
            property_id=dto.property_id,
            user_id=user_id,
            message=dto.message,
        )
        inquiry = await self._repo.create(inquiry)

        # ── Email notifications (failure must not break inquiry creation) ──
        try:
            tenant = await self._user_repo.get_by_id(user_id)
            tenant_name = f"{tenant.first_name} {tenant.last_name}" if tenant else "A Tenant"

            recipients: list[tuple[str, str]] = []
            if prop.owner_id:
                owner = await self._user_repo.get_by_id(prop.owner_id)
                if owner:
                    recipients.append((owner.email, f"{owner.first_name} {owner.last_name}"))
            if prop.broker_id and prop.broker_id != prop.owner_id:
                broker = await self._user_repo.get_by_id(prop.broker_id)
                if broker:
                    recipients.append((broker.email, f"{broker.first_name} {broker.last_name}"))

            for email_addr, name in recipients:
                await self._email_service.send_inquiry_notification(
                    email_addr, name, tenant_name, prop.title, dto.message
                )
        except Exception as exc:
            logger.warning("Inquiry email notification failed: %s", exc)

        return inquiry

    async def get_inquiry(self, inquiry_id: int) -> Inquiry:
        inquiry = await self._repo.get_by_id(inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
        return inquiry

    async def respond_to_inquiry(
        self,
        inquiry_id: int,
        dto: InquiryRespondDTO,
        actor_user_id: int,
        actor_role: str,
        is_admin: bool = False,
    ) -> Inquiry:
        inquiry = await self.get_inquiry(inquiry_id)
        prop = await self._property_repo.get_by_id(inquiry.property_id)
        role = (actor_role or "").upper()
        is_owner = prop.owner_id == actor_user_id
        is_broker = prop.broker_id == actor_user_id
        if not is_admin and role != "ADMIN" and not is_owner and not is_broker:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        inquiry.respond(dto.response)
        inquiry = await self._repo.update(inquiry)

        # ── Notify tenant about the response ──────────────────────────────
        try:
            tenant = await self._user_repo.get_by_id(inquiry.user_id)
            if tenant:
                await self._email_service.send_inquiry_response(
                    tenant.email,
                    f"{tenant.first_name} {tenant.last_name}",
                    prop.title,
                    dto.response,
                )
        except Exception as exc:
            logger.warning("Inquiry response email notification failed: %s", exc)

        return inquiry

    async def get_property_inquiries(self, property_id: int, actor_user_id: int, actor_role: str, is_admin: bool = False):
        prop = await self._property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        role = (actor_role or "").upper()
        is_owner = prop.owner_id == actor_user_id
        is_broker = prop.broker_id == actor_user_id
        if not is_admin and role != "ADMIN" and not is_owner and not is_broker:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return await self._repo.get_by_property(property_id)

    async def get_assigned_inquiries(self, actor_user_id: int, actor_role: str):
        role = (actor_role or "").upper()
        if role == "ADMIN":
            return await self._repo.get_all(skip=0, limit=500)
        if role == "OWNER":
            return await self._repo.get_by_owner(actor_user_id)
        if role == "BROKER":
            return await self._repo.get_by_broker(actor_user_id)
        return []

    async def get_user_inquiries(self, user_id: int):
        return await self._repo.get_by_user(user_id)

    async def list_inquiries(self, skip: int = 0, limit: int = 100):
        return await self._repo.get_all(skip=skip, limit=limit)

    async def delete_inquiry(self, inquiry_id: int) -> bool:
        await self.get_inquiry(inquiry_id)
        return await self._repo.delete(inquiry_id)


class FavoriteUseCase:
    def __init__(
        self,
        favorite_repo: IFavoriteRepository,
        property_repo: IPropertyRepository,
    ):
        self._repo = favorite_repo
        self._property_repo = property_repo

    async def add_favorite(self, user_id: int, property_id: int) -> Favorite:
        prop = await self._property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        exists = await self._repo.exists(user_id, property_id)
        if exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in favorites")

        fav = Favorite(user_id=user_id, property_id=property_id)
        return await self._repo.create(fav)

    async def remove_favorite(self, user_id: int, property_id: int) -> bool:
        exists = await self._repo.exists(user_id, property_id)
        if not exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in favorites")
        return await self._repo.delete(user_id, property_id)

    async def get_user_favorites(self, user_id: int):
        return await self._repo.get_by_user(user_id)
