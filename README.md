# 🏠 BrokerSaaS — Smart Property & Rental Management Platform

A production-ready, full-stack SaaS built with **Clean Architecture + DDD**, featuring a **FastAPI** backend and a **React + TailwindCSS** frontend, fully containerised with **Docker Compose**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI 0.111 + Python 3.11 |
| ORM | SQLAlchemy 2.0 async (asyncpg) |
| Database | PostgreSQL 15 |
| Migrations | Alembic 1.13 |
| Auth | PyJWT 2.8 (access + refresh tokens) |
| Password hashing | bcrypt 4.1 |
| Validation | Pydantic v2 + pydantic-settings |
| Frontend | React 18 + Vite 5 |
| Styling | TailwindCSS 3 |
| HTTP client | Axios (with auto-refresh interceptor) |
| Routing | React Router v6 |
| Charts | Recharts |
| Containerisation | Docker + Docker Compose |

---

## Architecture

```
backend/app/
├── domain/            # Pure Python — Entities, Value Objects, Repository interfaces, Domain Services
├── application/       # Use Cases + DTOs (Pydantic v2)
├── infrastructure/    # SQLAlchemy models, repository implementations, security (JWT + bcrypt)
└── presentation/      # FastAPI routers, DI container (Depends)

frontend/src/
├── context/           # AuthContext (JWT storage, role helpers)
├── infrastructure/    # Axios instance with auto token-refresh
└── presentation/
    ├── routes/        # ProtectedRoute (role-based)
    ├── layouts/       # DashboardLayout (role-aware sidebar)
    ├── components/    # Modal, StatCard, Badge
    └── pages/         # auth/, public/, admin/, owner/, tenant/, broker/
```

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker Desktop ≥ 24
- Docker Compose v2

### 1. Clone & configure

```bash
git clone <repo-url> broker
cd broker
cp backend/.env.example backend/.env   # edit if needed
```

### 2. Start all services

```bash
docker compose up --build
```

Services started:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| PostgreSQL | localhost:5432 |

### 3. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. Seed initial data

```bash
docker compose exec backend python seed.py
```

This creates:
- Master data: Roles, Property Types, Listing Types, Regions, Districts
- 4 test users (see below)

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@broker.com | Admin@1234 |
| Owner | owner@broker.com | Owner@1234 |
| Tenant | tenant@broker.com | Tenant@1234 |
| Broker | broker@broker.com | Broker@1234 |

---

## Running Locally (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# or: source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Set environment variables (or create a .env file)
set DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/broker_db
set SECRET_KEY=dev-secret-key

# Run migrations
alembic upgrade head

# Seed data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

---

## API Overview

All routes are under `/api/v1`.

| Router | Prefix | Auth |
|---|---|---|
| Auth | `/auth` | Public / Bearer |
| Users | `/users` | Admin |
| Properties | `/properties` | Mixed |
| Units | `/units` | Owner |
| Tenants | `/tenants` | Owner |
| Leases | `/leases` | Owner / Tenant |
| Payments | `/payments` | Owner / Tenant |
| Maintenance | `/maintenance` | Owner / Tenant |
| Inquiries | `/inquiries` | Mixed |
| Favorites | `/favorites` | Tenant |
| Commissions | `/commissions` | Owner / Broker |
| Admin | `/admin` | Admin |
| Master (read) | `/master` | Public |

---

## Role Permissions

| Feature | Admin | Owner | Tenant | Broker |
|---|---|---|---|---|
| User management | ✅ | — | — | — |
| Master data CRUD | ✅ | — | — | — |
| Add / manage properties | — | ✅ | — | — |
| Manage units | — | ✅ | — | — |
| Create / manage leases | — | ✅ | — | — |
| View own lease | — | — | ✅ | — |
| View / pay payments | — | ✅ | ✅ | — |
| Submit maintenance | — | — | ✅ | — |
| Manage maintenance | — | ✅ | — | — |
| Browse marketplace | ✅ | ✅ | ✅ | ✅ |
| Inquiries / Favorites | — | — | ✅ | — |
| Commissions | — | ✅ | — | ✅ |

---

## Environment Variables

See `backend/.env.example` for all options. Key variables:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/broker_db
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Development Notes

- **Migrations**: After changing a model run `alembic revision --autogenerate -m "description"` then `alembic upgrade head`
- **Type safety**: Backend uses strict Pydantic v2 models; run `mypy` for static analysis
- **Tests**: Add tests in `backend/tests/` using `pytest-asyncio`
- **Production**: Set `DEBUG=false`, use strong `SECRET_KEY`, configure proper CORS origins

---

## Project Structure (condensed)

```
broker/
├── backend/
│   ├── app/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── seed.py
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml
```
