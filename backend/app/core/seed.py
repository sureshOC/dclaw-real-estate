"""Demo seed data — runs on cold start if the DB is empty.

Uses fixed deterministic UUIDs so JWT tokens remain valid across cold starts
(Vercel wipes /tmp between function instances, forcing a re-seed each time).
"""
from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine
from app.core.security import hash_password
from app.models.expense import Expense, ExpenseCategory
from app.models.lease_event import LeaseEvent, LeaseEventType
from app.models.maintenance_request import MaintenanceRequest, MaintenanceStatus, Priority
from app.models.org import Organization, PlanTier
from app.models.property import Property, PropertyStatus, PropertyType
from app.models.rent_payment import RentPayment, PaymentStatus
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorSpecialty

# Fixed UUIDs — must never change so existing JWTs keep working across cold starts
ORG_ID  = UUID("a0000000-0000-0000-0000-000000000001")
USER_ID = UUID("a0000000-0000-0000-0000-000000000002")

_PROP_IDS = [UUID(f"b0000000-0000-0000-0000-{i:012d}") for i in range(1, 11)]
_TEN_IDS  = [UUID(f"c0000000-0000-0000-0000-{i:012d}") for i in range(1, 11)]
_VEN_IDS  = [UUID(f"d0000000-0000-0000-0000-{i:012d}") for i in range(1, 7)]


async def seed_demo_data() -> None:
    async with AsyncSession(engine, expire_on_commit=False) as session:
        result = await session.execute(select(Organization).limit(1))
        if result.scalar_one_or_none() is not None:
            return  # already seeded

        session.add(Organization(
            id=ORG_ID, name="Sunrise Properties", plan_tier=PlanTier.pro,
        ))
        session.add(User(
            id=USER_ID, org_id=ORG_ID,
            email="admin@sunrise.com",
            password_hash=hash_password("Password123!"),
            role=UserRole.owner, first_name="Admin", last_name="User",
        ))

        vendor_specs = [
            ("QuickFix Plumbing",      VendorSpecialty.plumbing,     "555-0101", "quickfix@example.com",  4.8),
            ("BrightSpark Electric",   VendorSpecialty.electrical,   "555-0102", "bright@example.com",    4.5),
            ("CoolAir HVAC",           VendorSpecialty.hvac,         "555-0103", "coolair@example.com",   4.7),
            ("HandyPro General",       VendorSpecialty.general,      "555-0104", "handy@example.com",     4.2),
            ("GreenThumb Landscaping", VendorSpecialty.landscaping,  "555-0105", "green@example.com",     4.6),
            ("RoofRight Co",           VendorSpecialty.roofing,      "555-0106", "roof@example.com",      4.4),
        ]
        for vid, (name, spec, phone, email, rating) in zip(_VEN_IDS, vendor_specs):
            session.add(Vendor(id=vid, name=name, specialty=spec, phone=phone, email=email, rating=rating))

        prop_specs = [
            ("Maple Street Duplex",    "101 Maple St",    "Austin", "TX", "78701", 2800, PropertyType.house,      3,    2.0, 1400, PropertyStatus.rented),
            ("Oak Avenue Apartment",   "202 Oak Ave",     "Austin", "TX", "78702", 1950, PropertyType.apartment,  2,    1.0,  900, PropertyStatus.rented),
            ("Pine Rd Condo",          "303 Pine Rd",     "Austin", "TX", "78703", 2200, PropertyType.condo,      2,    2.0, 1100, PropertyStatus.rented),
            ("Cedar Lane House",       "404 Cedar Ln",    "Austin", "TX", "78704", 3200, PropertyType.house,      4,    3.0, 2000, PropertyStatus.rented),
            ("Elm St Studio",          "505 Elm St",      "Austin", "TX", "78705", 1400, PropertyType.apartment,  1,    1.0,  600, PropertyStatus.available),
            ("Birch Blvd Condo",       "606 Birch Blvd",  "Austin", "TX", "78706", 2500, PropertyType.condo,      3,    2.0, 1300, PropertyStatus.rented),
            ("Willow Way House",       "707 Willow Way",  "Austin", "TX", "78707", 3500, PropertyType.house,      4,    2.5, 2200, PropertyStatus.rented),
            ("Spruce Court Apt",       "808 Spruce Ct",   "Austin", "TX", "78708", 1800, PropertyType.apartment,  2,    1.0,  850, PropertyStatus.rented),
            ("Ash Street Commercial",  "909 Ash St",      "Austin", "TX", "78709", 4500, PropertyType.commercial, None, None, 3000, PropertyStatus.rented),
            ("Poplar Place House",     "1010 Poplar Pl",  "Austin", "TX", "78710", 2600, PropertyType.house,      3,    2.0, 1600, PropertyStatus.available),
        ]
        props = []
        for pid, (title, addr, city, state, zipcode, price, ptype, beds, baths, sqft, status) in zip(_PROP_IDS, prop_specs):
            p = Property(
                id=pid, org_id=ORG_ID, title=title, address=addr,
                city=city, state=state, zip_code=zipcode, price=price,
                property_type=ptype, bedrooms=beds, bathrooms=baths,
                square_feet=sqft, status=status,
            )
            props.append(p)
            session.add(p)

        tenant_specs = [
            ("James",   "Carter",    "james.carter@email.com",  "555-1001", 0, "2026-01-01", "2026-12-31", 2800),
            ("Maria",   "Rodriguez", "maria.r@email.com",       "555-1002", 1, "2026-02-01", "2027-01-31", 1950),
            ("Kevin",   "Nguyen",    "k.nguyen@email.com",      "555-1003", 2, "2025-06-01", "2026-05-31", 2200),
            ("Sarah",   "Johnson",   "sarah.j@email.com",       "555-1004", 3, "2025-09-01", "2026-08-31", 3200),
            ("David",   "Lee",       "d.lee@email.com",         "555-1005", 5, "2026-03-01", "2027-02-28", 2500),
            ("Emma",    "Wilson",    "emma.w@email.com",        "555-1006", 6, "2025-07-01", "2026-06-30", 3500),
            ("Carlos",  "Martinez",  "c.martinez@email.com",    "555-1007", 7, "2025-10-01", "2026-09-30", 1800),
            ("Linda",   "Chen",      "linda.c@email.com",       "555-1008", 8, "2026-01-15", "2026-12-31", 4500),
            ("Robert",  "Kim",       "r.kim@email.com",         "555-1009", 1, "2025-08-01", "2026-07-31", 1950),
            ("Jessica", "Brown",     "j.brown@email.com",       "555-1010", 3, "2026-04-01", "2027-03-31", 3200),
        ]
        tenants = []
        for tid, (first, last, email, phone, prop_idx, ls, le, rent) in zip(_TEN_IDS, tenant_specs):
            t = Tenant(
                id=tid, org_id=ORG_ID, first_name=first, last_name=last,
                email=email, phone=phone, property_id=props[prop_idx].id,
                lease_start=date.fromisoformat(ls), lease_end=date.fromisoformat(le),
                rent_amount=rent, income=rent * 4, screening_score=750,
                screening_tier="approved",
            )
            tenants.append(t)
            session.add(t)

        mr_specs = [
            (0, 0, "Leaky faucet in kitchen",       "Kitchen faucet drips constantly",   Priority.medium,    MaintenanceStatus.resolved),
            (1, 1, "Broken AC unit",                "AC not cooling below 85F",           Priority.high,      MaintenanceStatus.in_progress),
            (2, 2, "Cracked window",                "Bedroom window has a crack",         Priority.low,       MaintenanceStatus.open),
            (3, 3, "Roof leak",                     "Water stain on ceiling after rain",  Priority.emergency, MaintenanceStatus.in_progress),
            (5, 4, "Electrical outlet not working", "Outlet in living room dead",         Priority.medium,    MaintenanceStatus.open),
            (6, 5, "Landscaping overgrown",         "Backyard needs trimming",            Priority.low,       MaintenanceStatus.open),
            (7, 6, "Garbage disposal jammed",       "Disposal stopped working",           Priority.medium,    MaintenanceStatus.resolved),
            (8, 7, "HVAC filter replacement",       "Routine filter change",              Priority.low,       MaintenanceStatus.resolved),
            (1, 8, "Parking lot light out",         "Light fixture needs bulb",           Priority.low,       MaintenanceStatus.open),
            (3, 9, "Water heater noise",            "Rumbling from water heater",         Priority.medium,    MaintenanceStatus.open),
        ]
        for i, (prop_idx, ten_idx, title, desc, prio, status) in enumerate(mr_specs):
            mid = UUID(f"e0000000-0000-0000-0000-{i+1:012d}")
            session.add(MaintenanceRequest(
                id=mid, org_id=ORG_ID,
                property_id=props[prop_idx].id,
                tenant_id=tenants[ten_idx].id,
                title=title, description=desc, priority=prio, status=status,
            ))

        for t_idx in range(5):
            for mo in range(1, 6):
                pid = UUID(f"f{t_idx}000000-0000-0000-0000-{mo:012d}")
                session.add(RentPayment(
                    id=pid, org_id=ORG_ID,
                    tenant_id=tenants[t_idx].id,
                    property_id=props[t_idx].id,
                    amount=tenants[t_idx].rent_amount,
                    due_date=date(2026, mo, 1),
                    paid_date=date(2026, mo, 1 if mo != 3 else 3),
                    status=PaymentStatus.paid,
                ))

        expense_cats = [
            ExpenseCategory.insurance, ExpenseCategory.tax,
            ExpenseCategory.maintenance, ExpenseCategory.utilities,
            ExpenseCategory.mortgage,
        ]
        for i, prop in enumerate(props[:5]):
            eid = UUID(f"00000000-0000-0000-0001-{i+1:012d}")
            session.add(Expense(
                id=eid, property_id=prop.id,
                category=expense_cats[i],
                amount=200 + i * 75,
                description=f"Monthly {expense_cats[i].value} for {prop.title}",
                expense_date=date(2026, 4, 1),
            ))

        for i, t in enumerate(tenants[:5]):
            lid = UUID(f"00000000-0000-0000-0002-{i+1:012d}")
            session.add(LeaseEvent(
                id=lid, tenant_id=t.id,
                event_type=LeaseEventType.created,
                effective_date=t.lease_start,
                rent_amount=t.rent_amount,
                notes=f"Lease created for {t.first_name} {t.last_name}",
            ))

        await session.commit()
