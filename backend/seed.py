"""
Seed script: initializes master data and creates test users.

Usage:
    python seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.database import AsyncSessionLocal
from app.infrastructure.db.models import (
    RoleModel, PropertyTypeModel, ListingTypeModel, RegionModel, DistrictModel, UserModel,
    CurrencyModel,
    PropertyModel, AmenityModel, PropertyAmenityModel, PropertyImageModel, ReviewModel,
)
from app.infrastructure.security.password import PasswordHasher


async def seed():
    async with AsyncSessionLocal() as session:
        await seed_roles(session)
        await seed_property_types(session)
        await seed_listing_types(session)
        await seed_regions_districts(session)
        await seed_currencies(session)
        await seed_users(session)
        await seed_properties(session)
        await seed_amenities(session)
        await seed_property_images(session)
        await seed_reviews(session)
        await session.commit()
        print("\n✅ Seed data inserted successfully!")
        print("\nTest Accounts Created:")
        print("─" * 50)
        print("ADMIN   → kennyngoe@gmail.com   / Ngoe@123")
        print("OWNER   → owner@broker.com      / Owner@1234")
        print("TENANT  → tenant@broker.com     / Tenant@1234")
        print("BROKER  → broker@broker.com     / Broker@1234")
        print("─" * 50)


async def seed_roles(session: AsyncSession):
    roles = [
        {"name": "ADMIN", "description": "System administrator with full access"},
        {"name": "OWNER", "description": "Property owner / landlord"},
        {"name": "TENANT", "description": "Property tenant"},
        {"name": "BROKER", "description": "Real estate broker / agent"},
    ]
    for r in roles:
        exists = await session.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(RoleModel).where(RoleModel.name == r["name"])
        )
        if not exists.scalar_one_or_none():
            session.add(RoleModel(**r))
            print(f"  ✓ Role: {r['name']}")
    await session.flush()


async def seed_property_types(session: AsyncSession):
    types = [
        {"name": "Apartment", "description": "Residential apartment unit"},
        {"name": "House", "description": "Standalone residential house"},
        {"name": "Villa", "description": "Luxury villa property"},
        {"name": "Office", "description": "Commercial office space"},
        {"name": "Shop", "description": "Retail shop space"},
        {"name": "Warehouse", "description": "Storage and industrial space"},
        {"name": "Land", "description": "Undeveloped land plot"},
    ]
    from sqlalchemy import select
    for t in types:
        exists = await session.execute(select(PropertyTypeModel).where(PropertyTypeModel.name == t["name"]))
        if not exists.scalar_one_or_none():
            session.add(PropertyTypeModel(**t))
            print(f"  ✓ PropertyType: {t['name']}")
    await session.flush()


async def seed_listing_types(session: AsyncSession):
    from sqlalchemy import select
    types = [
        {"name": "FOR_RENT", "description": "Available for rental"},
        {"name": "FOR_SALE", "description": "Available for purchase"},
        {"name": "BOTH", "description": "Available for rent or sale"},
    ]
    for t in types:
        exists = await session.execute(select(ListingTypeModel).where(ListingTypeModel.name == t["name"]))
        if not exists.scalar_one_or_none():
            session.add(ListingTypeModel(**t))
            print(f"  ✓ ListingType: {t['name']}")
    await session.flush()


async def seed_regions_districts(session: AsyncSession):
    from sqlalchemy import select
    regions_data = {
        "Greater Accra": ["Accra Central", "Tema", "East Legon", "Cantonments", "Osu", "Spintex"],
        "Ashanti": ["Kumasi Central", "Nhyiaeso", "Bantama", "Suame"],
        "Western": ["Takoradi", "Sekondi", "Tarkwa"],
        "Eastern": ["Koforidua", "Nkawkaw", "Mpraeso"],
        "Northern": ["Tamale Central", "Sagnarigu", "Tolon"],
    }
    for region_name, districts in regions_data.items():
        r_exists = await session.execute(select(RegionModel).where(RegionModel.name == region_name))
        region = r_exists.scalar_one_or_none()
        if not region:
            region = RegionModel(name=region_name)
            session.add(region)
            await session.flush()
            print(f"  ✓ Region: {region_name}")

        for d_name in districts:
            d_exists = await session.execute(
                select(DistrictModel).where(
                    DistrictModel.name == d_name, DistrictModel.region_id == region.id
                )
            )
            if not d_exists.scalar_one_or_none():
                session.add(DistrictModel(name=d_name, region_id=region.id))
    await session.flush()


async def seed_users(session: AsyncSession):
    from sqlalchemy import select
    hasher = PasswordHasher()

    # Get role IDs
    roles = {}
    for name in ["ADMIN", "OWNER", "TENANT", "BROKER"]:
        r = await session.execute(select(RoleModel).where(RoleModel.name == name))
        role = r.scalar_one_or_none()
        if role:
            roles[name] = role.id

    users = [
        {"email": "kennyngoe@gmail.com", "password": "Ngoe@123", "first_name": "Ngoe", "last_name": "Admin", "role": "ADMIN"},
        {"email": "owner@broker.com", "password": "Owner@1234", "first_name": "John", "last_name": "Owner", "role": "OWNER"},
        {"email": "tenant@broker.com", "password": "Tenant@1234", "first_name": "Jane", "last_name": "Tenant", "role": "TENANT"},
        {"email": "broker@broker.com", "password": "Broker@1234", "first_name": "Mike", "last_name": "Broker", "role": "BROKER"},
    ]

    for u in users:
        exists = await session.execute(select(UserModel).where(UserModel.email == u["email"]))
        if not exists.scalar_one_or_none():
            role_id = roles.get(u["role"])
            if role_id:
                session.add(UserModel(
                    email=u["email"],
                    hashed_password=hasher.hash(u["password"]),
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    role_id=role_id,
                    is_active=True,
                    is_verified=True,
                ))
                print(f"  ✓ User: {u['email']} ({u['role']})")
    await session.flush()


async def seed_currencies(session: AsyncSession):
    from sqlalchemy import select
    currencies = [
        {"name": "Ghana Cedi", "code": "GHS", "symbol": "GH₵", "description": "Ghanaian Cedi"},
        {"name": "US Dollar", "code": "USD", "symbol": "$", "description": "United States Dollar"},
        {"name": "Euro", "code": "EUR", "symbol": "€", "description": "Euro"},
    ]
    for c in currencies:
        exists = await session.execute(select(CurrencyModel).where(CurrencyModel.code == c["code"]))
        if not exists.scalar_one_or_none():
            session.add(CurrencyModel(**c))
            print(f"  ✓ Currency: {c['code']}")
    await session.flush()


async def seed_properties(session: AsyncSession):
    from sqlalchemy import select

    # Fetch lookup maps
    pt_rows = (await session.execute(select(PropertyTypeModel))).scalars().all()
    lt_rows = (await session.execute(select(ListingTypeModel))).scalars().all()
    dt_rows = (await session.execute(select(DistrictModel))).scalars().all()
    cu_rows = (await session.execute(select(CurrencyModel))).scalars().all()
    owner = (await session.execute(select(UserModel).where(UserModel.email == "owner@broker.com"))).scalar_one_or_none()
    broker = (await session.execute(select(UserModel).where(UserModel.email == "broker@broker.com"))).scalar_one_or_none()
    
    if not owner:
        print("  ⚠ Owner user not found, skipping properties.")
        return

    pt = {r.name: r.id for r in pt_rows}
    lt = {r.name: r.id for r in lt_rows}
    dt = {r.name: r.id for r in dt_rows}
    cu = {r.code: r.id for r in cu_rows}
    default_currency_id = cu.get("GHS")

    properties_data = [
        # ─── Apartments ────────────────────────────────────────────────────────
        {
            "title": "Modern 2BR Apartment in East Legon",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("East Legon"),
            "currency_id": cu.get("GHS"),
            "price": "3500.00",
            "bedrooms": 2, "bathrooms": 2, "area_sqm": "95.00",
            "address": "15 Jungle Avenue, East Legon, Accra",
            "description": (
                "Beautifully finished 2-bedroom apartment on the 4th floor of a secure gated estate. "
                "Features open-plan living and dining, a fully fitted kitchen with granite countertops, "
                "built-in wardrobes, and a private balcony with city views. "
                "Amenities include 24/7 security, CCTV, backup generator, swimming pool, and ample parking. "
                "Walking distance to top restaurants, supermarkets and international schools."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.63600", "longitude": "-0.16500",
        },
        {
            "title": "Cozy Studio Apartment – Osu",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Osu"),
            "currency_id": cu.get("GHS"),
            "price": "1800.00",
            "bedrooms": 1, "bathrooms": 1, "area_sqm": "48.00",
            "address": "Oxford Street Extension, Osu, Accra",
            "description": (
                "Charming studio apartment in the heart of Osu. "
                "The unit boasts high ceilings, polished concrete floors, a modern fitted kitchen, "
                "air conditioning, and a private bathroom with a rainfall shower. "
                "Located steps away from vibrant restaurants, coffee shops, and nightlife. "
                "Ideal for young professionals or expats. Water and internet included."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.55400", "longitude": "-0.18800",
        },
        {
            "title": "Spacious 3BR Apartment – Cantonments",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Cantonments"),
            "currency_id": cu.get("GHS"),
            "price": "5200.00",
            "bedrooms": 3, "bathrooms": 3, "area_sqm": "145.00",
            "address": "Ridge Road, Cantonments, Accra",
            "description": (
                "Prestigious 3-bedroom apartment in one of Accra's most sought-after diplomatic neighbourhoods. "
                "Open-plan layout with floor-to-ceiling windows, chef's kitchen, guest WC, and a large wrap-around balcony. "
                "Building facilities include concierge service, rooftop pool, fully equipped gym, and underground parking. "
                "Close to embassies, the A&C Mall and the Accra International Conference Centre."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.57400", "longitude": "-0.18300",
        },
        {
            "title": "Affordable 1BR Apartment – Tema",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Tema"),
            "currency_id": cu.get("GHS"),
            "price": "1200.00",
            "bedrooms": 1, "bathrooms": 1, "area_sqm": "55.00",
            "address": "Community 4, Tema, Greater Accra",
            "description": (
                "Well-maintained 1-bedroom apartment in a quiet cul-de-sac in Tema Community 4. "
                "Tiled throughout, fitted kitchen, ceiling fans, and a private courtyard. "
                "Secure compound with watchman, close to banks, health centre, and the Tema Market. "
                "Great value for money – water and waste disposal included."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.67000", "longitude": "-0.01600",
        },
        # ─── Houses ────────────────────────────────────────────────────────────
        {
            "title": "4-Bedroom Family Home – Spintex",
            "property_type_id": pt.get("House"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("Spintex"),
            "currency_id": cu.get("USD"),
            "price": "320000.00",
            "bedrooms": 4, "bathrooms": 3, "area_sqm": "220.00",
            "address": "Spintex Road, Plot 22, Accra",
            "description": (
                "Elegant 4-bedroom detached house on a 600 m² plot in a serene neighbourhood off Spintex Road. "
                "Ground floor features a large living/dining area, modern kitchen with island, and a guest bedroom en-suite. "
                "Upper floor has the master bedroom with walk-in wardrobe, two additional bedrooms, and a shared bathroom. "
                "Includes a double garage, boys' quarters, borehole, and solar water heater. "
                "Gated estate with round-the-clock security. Perfect for families."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.65200", "longitude": "-0.12700",
        },
        {
            "title": "3-Bedroom Semi-Detached House – Bantama, Kumasi",
            "property_type_id": pt.get("House"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Bantama"),
            "currency_id": cu.get("GHS"),
            "price": "2800.00",
            "bedrooms": 3, "bathrooms": 2, "area_sqm": "160.00",
            "address": "Bantama High Street, Kumasi",
            "description": (
                "Tastefully finished semi-detached 3-bedroom house in Bantama. "
                "Fan-cooled bedrooms, a bright kitchen with fitted cabinets, spacious living room, and a private garden. "
                "One bedroom has an en-suite bathroom; the other two share a modern family bathroom. "
                "Gated compound with parking for two cars. Electricity prepaid meter and reliable borehole water. "
                "5 minutes' drive to Kumasi City Mall and Komfo Anokye Teaching Hospital."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "6.69800", "longitude": "-1.60700",
        },
        {
            "title": "Newly Built 5BR Executive House – Nhyiaeso, Kumasi",
            "property_type_id": pt.get("House"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("Nhyiaeso"),
            "currency_id": cu.get("USD"),
            "price": "480000.00",
            "bedrooms": 5, "bathrooms": 4, "area_sqm": "310.00",
            "address": "Royal Estates, Nhyiaeso, Kumasi",
            "description": (
                "Brand-new executive 5-bedroom home in an exclusive gated community in Nhyiaeso. "
                "Architecturally designed with a grand entrance, double-volume living room, imported tile flooring, "
                "and a state-of-the-art kitchen with built-in appliances. "
                "Master suite boasts a Jacuzzi bathroom and panoramic views. "
                "Landscaped garden, 3-car garage, staff quarters, and inverter backup power. "
                "Priced to sell — viewing highly recommended."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "6.68200", "longitude": "-1.58900",
        },
        # ─── Villas ────────────────────────────────────────────────────────────
        {
            "title": "Luxury Beachfront Villa – Takoradi",
            "property_type_id": pt.get("Villa"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("Takoradi"),
            "currency_id": cu.get("USD"),
            "price": "950000.00",
            "bedrooms": 5, "bathrooms": 5, "area_sqm": "450.00",
            "address": "Beach Road, Takoradi",
            "description": (
                "Stunning 5-bedroom beachfront villa with direct access to a private sandy beach. "
                "The property features an infinity pool, open-plan kitchen and dining, home theatre, gym, and wine cellar. "
                "Every bedroom has an en-suite bathroom with ocean-facing balconies. "
                "The grounds include a 3-car garage, caretaker cottage, generator house, and lush tropical landscaping. "
                "A rare gem in the Western Region — ideal for a high-end family residence or luxury holiday rental investment."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "4.89300", "longitude": "-1.75500",
        },
        {
            "title": "4BR Contemporary Villa – East Legon Hills",
            "property_type_id": pt.get("Villa"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("East Legon"),
            "price": "9500.00",
            "bedrooms": 4, "bathrooms": 4, "area_sqm": "380.00",
            "address": "East Legon Hills, Accra",
            "description": (
                "Architecturally striking contemporary villa perched on the hills of East Legon with panoramic city views. "
                "Features a private heated pool, outdoor entertainment deck, open-plan living areas with 4-meter ceilings, "
                "and a fully equipped smart-home system. "
                "Chef's kitchen with integrated appliances, home office, and a cinema room. "
                "Gated and walled compound with covered parking for 4 vehicles. "
                "Available for rent – ideal for senior executives or diplomats."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.64700", "longitude": "-0.15800",
        },
        # ─── Offices ───────────────────────────────────────────────────────────
        {
            "title": "Grade-A Office Space – Accra Central",
            "property_type_id": pt.get("Office"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Accra Central"),
            "price": "4500.00",
            "bedrooms": 0, "bathrooms": 2, "area_sqm": "200.00",
            "address": "Independence Avenue, Accra Central",
            "description": (
                "Premium Grade-A office floor in a prestigious high-rise on Independence Avenue. "
                "200 m² of open-plan space with floor-to-ceiling glazing, raised flooring for data cabling, "
                "two executive boardrooms, a reception area, and private washrooms. "
                "Building amenities include 24-hour security, CCTV, high-speed fibre internet, "
                "dedicated power backup, and 10 parking bays. "
                "Ideal for law firms, financial institutions, or multinational companies."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.54900", "longitude": "-0.20200",
        },
        {
            "title": "Furnished Office Suite – Kumasi Central",
            "property_type_id": pt.get("Office"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Kumasi Central"),
            "price": "2200.00",
            "bedrooms": 0, "bathrooms": 1, "area_sqm": "80.00",
            "address": "Prempeh II Street, Kumasi",
            "description": (
                "Ready-to-move-in furnished office suite in a modern commercial block in Kumasi Central. "
                "Includes 4 workstations, a glass-walled meeting room, kitchenette, and a private bathroom. "
                "High-speed internet, air conditioning, and electricity backup are provided. "
                "Ground-floor unit with direct street frontage — great for professional services or a branch office. "
                "Shared reception and parking available."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "6.68800", "longitude": "-1.62300",
        },
        # ─── Shops ─────────────────────────────────────────────────────────────
        {
            "title": "Retail Shop – Oxford Street, Osu",
            "property_type_id": pt.get("Shop"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Osu"),
            "price": "3000.00",
            "bedrooms": 0, "bathrooms": 1, "area_sqm": "60.00",
            "address": "Oxford Street, Osu, Accra",
            "description": (
                "Prime ground-floor retail unit on the busiest stretch of Oxford Street in Osu. "
                "60 m² of open retail space with large display windows, polished concrete floors, "
                "a back stockroom, staff bathroom, and air conditioning. "
                "Excellent foot traffic — previously operated as a fashion boutique. "
                "Suitable for restaurant, café, boutique, pharmacy, or any retail concept. "
                "Three months' rent required as deposit."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.55600", "longitude": "-0.18700",
        },
        {
            "title": "Corner Shop Unit – Tamale Central",
            "property_type_id": pt.get("Shop"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Tamale Central"),
            "price": "800.00",
            "bedrooms": 0, "bathrooms": 1, "area_sqm": "40.00",
            "address": "Market Road, Tamale Central",
            "description": (
                "Highly visible corner shop unit at a busy intersection in Tamale Central market area. "
                "40 m² with roller-shutter entrance, built-in shelving, ceiling fans, and a storage room at the back. "
                "Electricity meter included. Ideal for a pharmacy, spare parts dealer, or grocery store. "
                "Affordable price — long-term tenants preferred."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "9.40400", "longitude": "-0.83900",
        },
        # ─── Land ──────────────────────────────────────────────────────────────
        {
            "title": "Freehold Land for Sale – Spintex Axis",
            "property_type_id": pt.get("Land"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("Spintex"),
            "price": "185000.00",
            "bedrooms": 0, "bathrooms": 0, "area_sqm": "1000.00",
            "address": "Spintex Road, Accra",
            "description": (
                "1,000 m² (approximately 1 plot) of freehold residential / mixed-use land along the Spintex Road corridor. "
                "The land is fully fenced, gated, and has a title deed (Freehold / Indenture). "
                "Access to municipal water and electricity connections on the boundary. "
                "Ideal for residential development, a medical facility, or a commercial complex. "
                "Located in a rapidly developing area with strong capital appreciation prospects."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.65700", "longitude": "-0.11900",
        },
        {
            "title": "Commercial Land – Tema Industrial Area",
            "property_type_id": pt.get("Land"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("Tema"),
            "price": "420000.00",
            "bedrooms": 0, "bathrooms": 0, "area_sqm": "5000.00",
            "address": "Meridian Industrial Area, Tema",
            "description": (
                "Rare opportunity to acquire 5,000 m² of industrial / commercial land in the heart of Tema's industrial zone. "
                "Fully fenced with security hut, already cleared and levelled. "
                "Site certificate and environmental permit in place. "
                "Three-phase electricity on-site, with excellent road access for heavy vehicles. "
                "Suitable for a factory, logistics hub, cold-storage facility, or warehousing complex."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.66800", "longitude": "-0.00800",
        },
        # ─── Warehouse ─────────────────────────────────────────────────────────
        {
            "title": "Warehouse & Logistics Hub – Tema Port Area",
            "property_type_id": pt.get("Warehouse"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Tema"),
            "price": "6500.00",
            "bedrooms": 0, "bathrooms": 2, "area_sqm": "800.00",
            "address": "Harbour Road, Tema",
            "description": (
                "800 m² secure warehouse located 2 km from Tema Port — ideal for importers, exporters, and logistics operators. "
                "12-metre clear height, 2 dock-leveller loading bays, heavy-duty epoxy floor, "
                "150-kVA backup generator, CCTV, and a 60 m² mezzanine office. "
                "24/7 security with biometric access. Available from next month with flexible lease terms."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.65500", "longitude": "0.01200",
        },
        # ─── More Apartments ───────────────────────────────────────────────────
        {
            "title": "Luxury 2BR Penthouse – Cantonments",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Cantonments"),
            "price": "7800.00",
            "bedrooms": 2, "bathrooms": 2, "area_sqm": "180.00",
            "address": "Liberation Road, Cantonments, Accra",
            "description": (
                "Stunning top-floor penthouse with sweeping 360° views of Accra. "
                "This fully furnished 2-bedroom unit features a private rooftop terrace with jacuzzi, "
                "designer interiors, a fully equipped kitchen with island seating, and a home office nook. "
                "Smart lighting, AV system, and motorised blackout blinds throughout. "
                "Concierge, valet parking, infinity pool, and spa on-site. "
                "Utilities and premium internet included in rent."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "5.56700", "longitude": "-0.18500",
        },
        {
            "title": "Budget 2BR Apartment – Suame, Kumasi",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("FOR_RENT"),
            "district_id": dt.get("Suame"),
            "price": "950.00",
            "bedrooms": 2, "bathrooms": 1, "area_sqm": "70.00",
            "address": "Suame Magazine Road, Kumasi",
            "description": (
                "Clean and affordable 2-bedroom apartment suitable for a young family or working couple. "
                "Tiled floors, decent kitchen, shared compound, and reliable borehole water. "
                "Located close to Suame Market for easy shopping and commuting. "
                "Quiet neighbourhood with low crime rate. Prepaid electricity meter."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "6.70400", "longitude": "-1.59500",
        },
        {
            "title": "Sea-View Apartment – Sekondi",
            "property_type_id": pt.get("Apartment"),
            "listing_type_id": lt.get("BOTH"),
            "district_id": dt.get("Sekondi"),
            "price": "2600.00",
            "bedrooms": 2, "bathrooms": 2, "area_sqm": "100.00",
            "address": "Beach Avenue, Sekondi",
            "description": (
                "Bright and airy 2-bedroom apartment on the 3rd floor with spectacular Atlantic Ocean views. "
                "Open-plan living area, fully equipped kitchen, en-suite master bedroom, and a covered balcony. "
                "Secure parking, backup water tank, and a rooftop communal terrace. "
                "Available for rent or outright purchase — a fantastic coastal lifestyle opportunity."
            ),
            "is_furnished": True, "is_published": True,
            "latitude": "4.94300", "longitude": "-1.70200",
        },
        {
            "title": "3BR Townhouse – East Legon",
            "property_type_id": pt.get("House"),
            "listing_type_id": lt.get("FOR_SALE"),
            "district_id": dt.get("East Legon"),
            "price": "275000.00",
            "bedrooms": 3, "bathrooms": 3, "area_sqm": "190.00",
            "address": "Ambassadorial Enclave, East Legon, Accra",
            "description": (
                "Sophisticated 3-bedroom townhouse in a boutique gated development in East Legon. "
                "Features include an open-plan kitchen and lounge, private courtyard, roof terrace with barbecue area, "
                "and a double garage. "
                "Each bedroom has an en-suite bathroom and fitted wardrobe. "
                "Fully alarmed with smart locks, video doorbell, and intercom. "
                "Walking distance to top schools, the Trade Fair area, and A&C Mall."
            ),
            "is_furnished": False, "is_published": True,
            "latitude": "5.63200", "longitude": "-0.16200",
        },
    ]

    for prop in properties_data:
        # Skip if any required FK resolved to None
        if not prop.get("property_type_id") or not prop.get("listing_type_id") or not prop.get("district_id"):
            print(f"  ⚠ Skipping '{prop['title']}' — missing FK lookup")
            continue
        if not prop.get("currency_id"):
            prop["currency_id"] = default_currency_id
        exists = await session.execute(
            select(PropertyModel).where(PropertyModel.title == prop["title"])
        )
        if not exists.scalar_one_or_none():
            session.add(PropertyModel(
                title=prop["title"],
                owner_id=owner.id,
                broker_id=broker.id if broker else None,
                property_type_id=prop["property_type_id"],
                listing_type_id=prop["listing_type_id"],
                district_id=prop["district_id"],
                currency_id=prop["currency_id"],
                price=prop["price"],
                bedrooms=prop["bedrooms"],
                bathrooms=prop["bathrooms"],
                area_sqm=prop.get("area_sqm"),
                address=prop.get("address"),
                description=prop.get("description"),
                is_furnished=prop["is_furnished"],
                is_published=prop["is_published"],
                latitude=prop.get("latitude"),
                longitude=prop.get("longitude"),
            ))
            print(f"  ✓ Property: {prop['title']}")
    await session.flush()


async def seed_amenities(session: AsyncSession):
    print("\n🏷  Seeding amenities...")
    from sqlalchemy import select
    amenities_data = [
        {"name": "WiFi", "icon": "📶", "category": "Technology"},
        {"name": "Air Conditioning", "icon": "❄️", "category": "Comfort"},
        {"name": "Kitchen", "icon": "🍳", "category": "Facilities"},
        {"name": "Parking", "icon": "🚗", "category": "Facilities"},
        {"name": "Swimming Pool", "icon": "🏊", "category": "Recreation"},
        {"name": "TV / Cable", "icon": "📺", "category": "Technology"},
        {"name": "Gym / Fitness", "icon": "💪", "category": "Recreation"},
        {"name": "Garden", "icon": "🌿", "category": "Outdoor"},
        {"name": "Security Guard", "icon": "🔒", "category": "Safety"},
        {"name": "Backup Generator", "icon": "⚡", "category": "Utilities"},
        {"name": "Water Heater", "icon": "🚿", "category": "Comfort"},
        {"name": "Balcony", "icon": "🏠", "category": "Outdoor"},
        {"name": "Washing Machine", "icon": "🧺", "category": "Appliances"},
        {"name": "Pet Friendly", "icon": "🐾", "category": "Lifestyle"},
        {"name": "Elevator", "icon": "🛗", "category": "Facilities"},
    ]
    for item in amenities_data:
        exists = await session.execute(select(AmenityModel).where(AmenityModel.name == item["name"]))
        if not exists.scalar_one_or_none():
            session.add(AmenityModel(**item))
            print(f"  ✓ Amenity: {item['icon']} {item['name']}")
    await session.flush()


async def seed_property_images(session: AsyncSession):
    print("\n🖼  Seeding property images...")
    from sqlalchemy import select
    properties = (await session.execute(select(PropertyModel))).scalars().all()
    image_sets = [
        [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
            "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200",
            "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
            "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200",
        ],
        [
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
            "https://images.unsplash.com/photo-1570129477492-45c003dc9944?w=1200",
            "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
        ],
        [
            "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
            "https://images.unsplash.com/photo-1600585154340-be6161a5e0e1?w=1200",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
        ],
        [
            "https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=1200",
            "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
            "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=1200",
        ],
    ]
    amenity_pool = (await session.execute(select(AmenityModel))).scalars().all()
    import random
    random.seed(42)
    for idx, prop in enumerate(properties):
        # Check if images already exist
        existing = await session.execute(
            select(PropertyImageModel).where(PropertyImageModel.property_id == prop.id)
        )
        if existing.scalars().first():
            continue
        img_set = image_sets[idx % len(image_sets)]
        for i, url in enumerate(img_set):
            session.add(PropertyImageModel(
                property_id=prop.id,
                url=url,
                caption=f"View {i+1}",
                is_primary=(i == 0),
                display_order=i,
            ))
        # Assign 4-8 random amenities
        chosen = random.sample(amenity_pool, min(random.randint(4, 8), len(amenity_pool)))
        for amenity in chosen:
            exists = await session.execute(
                select(PropertyAmenityModel).where(
                    PropertyAmenityModel.property_id == prop.id,
                    PropertyAmenityModel.amenity_id == amenity.id,
                )
            )
            if not exists.scalar_one_or_none():
                session.add(PropertyAmenityModel(property_id=prop.id, amenity_id=amenity.id))
        print(f"  ✓ Images + amenities for: {prop.title[:40]}")
    await session.flush()


async def seed_reviews(session: AsyncSession):
    print("\n⭐ Seeding reviews...")
    from sqlalchemy import select
    properties = (await session.execute(select(PropertyModel))).scalars().all()
    reviewers = [
        ("James Mensah", "https://i.pravatar.cc/80?img=11"),
        ("Abena Osei", "https://i.pravatar.cc/80?img=5"),
        ("Kwame Asante", "https://i.pravatar.cc/80?img=33"),
        ("Fatima Al-Hassan", "https://i.pravatar.cc/80?img=47"),
        ("Emmanuel Boateng", "https://i.pravatar.cc/80?img=68"),
        ("Ama Sarpong", "https://i.pravatar.cc/80?img=25"),
        ("Daniel Ofori", "https://i.pravatar.cc/80?img=60"),
        ("Grace Owusu", "https://i.pravatar.cc/80?img=9"),
    ]
    comments = [
        "Absolutely amazing property! The location is perfect and the amenities exceeded our expectations.",
        "Great value for money. Clean, spacious and well-maintained. Would definitely recommend.",
        "Beautiful place with a wonderful view. The host was very responsive and helpful.",
        "Exactly as described. We had a fantastic stay and the neighborhood felt very safe.",
        "Loved everything about this property. Modern finishes, great natural lighting.",
        "Very comfortable and convenient. Close to markets and main roads. Will rent again.",
        "Good property overall. A few minor issues but nothing that spoiled our experience.",
        "Stunning interior design. The kitchen and bathrooms are top-notch. Very satisfied.",
    ]
    stay_periods = ["January 2025", "March 2025", "November 2024", "December 2024", "February 2025", "April 2025"]
    import random
    random.seed(123)
    for prop in properties:
        existing = await session.execute(
            select(ReviewModel).where(ReviewModel.property_id == prop.id)
        )
        if existing.scalars().first():
            continue
        count = random.randint(3, 5)
        for i in range(count):
            name, avatar = reviewers[random.randint(0, len(reviewers) - 1)]
            session.add(ReviewModel(
                property_id=prop.id,
                reviewer_name=name,
                reviewer_avatar=avatar,
                rating=random.choice([4, 4, 5, 5, 5]),
                comment=comments[random.randint(0, len(comments) - 1)],
                stay_period=stay_periods[random.randint(0, len(stay_periods) - 1)],
            ))
        print(f"  ✓ {count} reviews for: {prop.title[:40]}")
    await session.flush()


if __name__ == "__main__":
    asyncio.run(seed())
