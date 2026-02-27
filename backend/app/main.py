from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.config.settings import get_settings
from app.presentation.api.auth_router import router as auth_router
from app.presentation.api.user_router import router as user_router
from app.presentation.api.property_router import router as property_router
from app.presentation.api.unit_router import router as unit_router
from app.presentation.api.business_routers import (
    tenant_router, lease_router, payment_router,
    maintenance_router, inquiry_router, favorites_router, commission_router,
)
from app.presentation.api.admin_router import router as admin_router, public_router as master_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Property & Rental Management SaaS Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(user_router, prefix=API_PREFIX)
app.include_router(property_router, prefix=API_PREFIX)
app.include_router(unit_router, prefix=API_PREFIX)
app.include_router(tenant_router, prefix=API_PREFIX)
app.include_router(lease_router, prefix=API_PREFIX)
app.include_router(payment_router, prefix=API_PREFIX)
app.include_router(maintenance_router, prefix=API_PREFIX)
app.include_router(inquiry_router, prefix=API_PREFIX)
app.include_router(favorites_router, prefix=API_PREFIX)
app.include_router(commission_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(master_router, prefix=API_PREFIX)


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} v{settings.APP_VERSION}", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
