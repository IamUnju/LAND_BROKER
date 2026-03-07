from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey, Date, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.infrastructure.db.database import Base
from app.domain.entities.unit import UnitStatus
from app.domain.entities.tenant import TenantStatus
from app.domain.entities.lease import LeaseStatus
from app.domain.entities.payment import PaymentStatus, PaymentMethod
from app.domain.entities.maintenance import MaintenanceStatus, MaintenancePriority
from app.domain.entities.inquiry import InquiryStatus
from app.domain.entities.commission import CommissionStatus


class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    users = relationship("UserModel", back_populates="role")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    role = relationship("RoleModel", back_populates="users")
    properties = relationship("PropertyModel", foreign_keys="PropertyModel.owner_id", back_populates="owner")
    brokered_properties = relationship("PropertyModel", foreign_keys="PropertyModel.broker_id", back_populates="broker")
    tenant_profile = relationship("TenantModel", back_populates="user", uselist=False)
    inquiries = relationship("InquiryModel", back_populates="user")
    favorites = relationship("FavoriteModel", back_populates="user")
    commissions = relationship("CommissionModel", back_populates="broker")


class PropertyTypeModel(Base):
    __tablename__ = "property_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    properties = relationship("PropertyModel", back_populates="property_type")


class ListingTypeModel(Base):
    __tablename__ = "listing_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    properties = relationship("PropertyModel", back_populates="listing_type")


class CurrencyModel(Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    symbol = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    properties = relationship("PropertyModel", back_populates="currency")


class RegionModel(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    code = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    districts = relationship("DistrictModel", back_populates="region")


class DistrictModel(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    region = relationship("RegionModel", back_populates="districts")
    properties = relationship("PropertyModel", back_populates="district")


class PropertyModel(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_type_id = Column(Integer, ForeignKey("property_types.id", ondelete="RESTRICT"), nullable=False)
    listing_type_id = Column(Integer, ForeignKey("listing_types.id", ondelete="RESTRICT"), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    currency_id = Column(Integer, ForeignKey("currencies.id", ondelete="RESTRICT"), nullable=False)
    price = Column(Numeric(14, 2), nullable=False)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    area_sqm = Column(Numeric(10, 2), nullable=True)
    address = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    is_furnished = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    broker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("UserModel", foreign_keys=[owner_id], back_populates="properties")
    broker = relationship("UserModel", foreign_keys=[broker_id], back_populates="brokered_properties")
    property_type = relationship("PropertyTypeModel", back_populates="properties")
    listing_type = relationship("ListingTypeModel", back_populates="properties")
    district = relationship("DistrictModel", back_populates="properties")
    currency = relationship("CurrencyModel", back_populates="properties")
    units = relationship("UnitModel", back_populates="property", cascade="all, delete-orphan")
    inquiries = relationship("InquiryModel", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("FavoriteModel", back_populates="property", cascade="all, delete-orphan")
    commissions = relationship("CommissionModel", back_populates="property", cascade="all, delete-orphan")
    images = relationship("PropertyImageModel", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImageModel.display_order")
    amenities = relationship("AmenityModel", secondary="property_amenities", back_populates="properties")
    reviews = relationship("ReviewModel", back_populates="property", cascade="all, delete-orphan")


class UnitModel(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    unit_number = Column(String(50), nullable=False)
    floor = Column(Integer, nullable=True)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    area_sqm = Column(Numeric(10, 2), nullable=True)
    rent_price = Column(Numeric(14, 2), nullable=True)
    sale_price = Column(Numeric(14, 2), nullable=True)
    status = Column(SAEnum(UnitStatus), default=UnitStatus.AVAILABLE, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    property = relationship("PropertyModel", back_populates="units")
    leases = relationship("LeaseModel", back_populates="unit", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceModel", back_populates="unit", cascade="all, delete-orphan")


class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    emergency_contact_name = Column(String(200), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    national_id = Column(String(100), nullable=True)
    occupation = Column(String(200), nullable=True)
    monthly_income = Column(Numeric(14, 2), nullable=True)
    status = Column(SAEnum(TenantStatus), default=TenantStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("UserModel", back_populates="tenant_profile")
    leases = relationship("LeaseModel", back_populates="tenant", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceModel", back_populates="tenant")


class LeaseModel(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    monthly_rent = Column(Numeric(14, 2), nullable=False)
    security_deposit = Column(Numeric(14, 2), nullable=False)
    status = Column(SAEnum(LeaseStatus), default=LeaseStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    unit = relationship("UnitModel", back_populates="leases")
    tenant = relationship("TenantModel", back_populates="leases")
    payments = relationship("PaymentModel", back_populates="lease", cascade="all, delete-orphan")


class PaymentModel(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    payment_date = Column(Date, nullable=True)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(SAEnum(PaymentMethod), nullable=True)
    reference_number = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    lease = relationship("LeaseModel", back_populates="payments")


class MaintenanceModel(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(SAEnum(MaintenancePriority), default=MaintenancePriority.MEDIUM, nullable=False)
    status = Column(SAEnum(MaintenanceStatus), default=MaintenanceStatus.PENDING, nullable=False)
    assigned_to = Column(String(200), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    unit = relationship("UnitModel", back_populates="maintenance_requests")
    tenant = relationship("TenantModel", back_populates="maintenance_requests")


class InquiryModel(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(SAEnum(InquiryStatus), default=InquiryStatus.PENDING, nullable=False)
    response = Column(Text, nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    property = relationship("PropertyModel", back_populates="inquiries")
    user = relationship("UserModel", back_populates="inquiries")


class FavoriteModel(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("UserModel", back_populates="favorites")
    property = relationship("PropertyModel", back_populates="favorites")


class CommissionModel(Base):
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    broker_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=False)
    transaction_amount = Column(Numeric(14, 2), nullable=False)
    status = Column(SAEnum(CommissionStatus), default=CommissionStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    property = relationship("PropertyModel", back_populates="commissions")
    broker = relationship("UserModel", back_populates="commissions")


class PropertyImageModel(Base):
    __tablename__ = "property_images"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    caption = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("PropertyModel", back_populates="images")


class AmenityModel(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(10), nullable=True)
    category = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    properties = relationship("PropertyModel", secondary="property_amenities", back_populates="amenities")


class PropertyAmenityModel(Base):
    __tablename__ = "property_amenities"

    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)


class ReviewModel(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    reviewer_name = Column(String(200), nullable=False)
    reviewer_avatar = Column(String(500), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    stay_period = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("PropertyModel", back_populates="reviews")
