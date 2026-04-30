"""
Seed data awal ERP Samas.
Jalankan: python app/database/seed.py
Idempotent — aman dijalankan ulang.
"""

from app.core.security import hash_password
from app.database.base import Base
from app.database.session import SessionLocal
from app.modules.areas.models import Area
from app.modules.auth.models import User
from app.modules.customers.models import Customer
from app.modules.products.models import Product
from app.modules.salesmen.models import Salesman


def seed():
    db = SessionLocal()
    try:
        # ── 1. AREAS ──────────────────────────────────────────
        areas_data = [
            {"name": "Surabaya"},
            {"name": "Gresik"},
            {"name": "Sidoarjo"},
        ]
        areas = {}
        for a in areas_data:
            existing = db.query(Area).filter(Area.name == a["name"]).first()
            if not existing:
                obj = Area(**a)
                db.add(obj)
                db.flush()
                areas[a["name"]] = obj
                print(f"  [+] Area: {a['name']}")
            else:
                areas[a["name"]] = existing
                print(f"  [=] Area exists: {a['name']}")

        # ── 2. SALESMEN ───────────────────────────────────────
        salesmen_data = [
            {"salesman_code": "SLS-001", "nama": "Ahmad Fauzi",  "phone": "081234567891", "id_area": areas["Surabaya"].id},
            {"salesman_code": "SLS-002", "nama": "Budi Santoso", "phone": "081234567892", "id_area": areas["Gresik"].id},
            {"salesman_code": "SLS-003", "nama": "Citra Dewi",   "phone": "081234567893", "id_area": areas["Sidoarjo"].id},
        ]
        salesmen = {}
        for s in salesmen_data:
            existing = db.query(Salesman).filter(Salesman.salesman_code == s["salesman_code"]).first()
            if not existing:
                obj = Salesman(**s)
                db.add(obj)
                db.flush()
                salesmen[s["salesman_code"]] = obj
                print(f"  [+] Salesman: {s['nama']}")
            else:
                salesmen[s["salesman_code"]] = existing
                print(f"  [=] Salesman exists: {s['nama']}")

        # ── 3. USERS ──────────────────────────────────────────
        users_data = [
            {
                "username": "admin",
                "email": "admin@erpsamas.com",
                "hashed_password": hash_password("admin123"),
                "role": "admin",
                "id_salesman": None,
            },
            {
                "username": "ahmad",
                "email": "ahmad@erpsamas.com",
                "hashed_password": hash_password("pass123"),
                "role": "salesman",
                "id_salesman": salesmen["SLS-001"].id,
            },
            {
                "username": "budi",
                "email": "budi@erpsamas.com",
                "hashed_password": hash_password("pass123"),
                "role": "salesman",
                "id_salesman": salesmen["SLS-002"].id,
            },
            {
                "username": "citra",
                "email": "citra@erpsamas.com",
                "hashed_password": hash_password("pass123"),
                "role": "salesman",
                "id_salesman": salesmen["SLS-003"].id,
            },
        ]
        for u in users_data:
            existing = db.query(User).filter(User.username == u["username"]).first()
            if not existing:
                obj = User(**u)
                db.add(obj)
                db.flush()
                print(f"  [+] User: {u['username']}")
            else:
                print(f"  [=] User exists: {u['username']}")

        # ── 4. CUSTOMERS ──────────────────────────────────────
        customers_data = [
            {
                "customer_code": "CUST-001",
                "nama": "Warung Bu Sri",
                "address": "Karangpilang, Surabaya",
                "phone": "031-1234001",
                "latitude": None,
                "longitude": None,
                "id_area": areas["Surabaya"].id,
                "id_salesman": salesmen["SLS-001"].id,
            },
            {
                "customer_code": "CUST-002",
                "nama": "Toko BD Mie",
                "address": "Ds Bambe, Kec Driyorejo, Gresik",
                "phone": "031-1234002",
                "latitude": -7.3416786,
                "longitude": 112.6612152,
                "id_area": areas["Gresik"].id,
                "id_salesman": salesmen["SLS-002"].id,
            },
            {
                "customer_code": "CUST-003",
                "nama": "Toko Sejahtera",
                "address": "Jl Untung, Sidoarjo",
                "phone": "031-1234003",
                "latitude": None,
                "longitude": None,
                "id_area": areas["Sidoarjo"].id,
                "id_salesman": salesmen["SLS-003"].id,
            },
            {
                "customer_code": "CUST-004",
                "nama": "Toko Maju Jaya",
                "address": "Karangpilang, Surabaya",
                "phone": "031-1234004",
                "latitude": None,
                "longitude": None,
                "id_area": areas["Surabaya"].id,
                "id_salesman": salesmen["SLS-001"].id,
            },
            {
                "customer_code": "CUST-005",
                "nama": "Toko Makmur",
                "address": "Jl Untung, Sidoarjo",
                "phone": "031-1234005",
                "latitude": None,
                "longitude": None,
                "id_area": areas["Sidoarjo"].id,
                "id_salesman": salesmen["SLS-003"].id,
            },
        ]
        for c in customers_data:
            existing = db.query(Customer).filter(Customer.customer_code == c["customer_code"]).first()
            if not existing:
                obj = Customer(**c)
                db.add(obj)
                db.flush()
                print(f"  [+] Customer: {c['nama']}")
            else:
                print(f"  [=] Customer exists: {c['nama']}")

        # ── 5. PRODUCTS ───────────────────────────────────────
        products_data = [
            {"product_code": "PRD-001", "nama": "Kopi Robusta 1kg",  "unit": "kg",  "price": 85000,  "stock_available": 500},
            {"product_code": "PRD-002", "nama": "Kopi Arabika 1kg",  "unit": "kg",  "price": 120000, "stock_available": 300},
            {"product_code": "PRD-003", "nama": "Kopi Blend 500g",   "unit": "pcs", "price": 45000,  "stock_available": 400},
            {"product_code": "PRD-004", "nama": "Gula Aren 1kg",     "unit": "kg",  "price": 35000,  "stock_available": 600},
            {"product_code": "PRD-005", "nama": "Susu Krimer 1kg",   "unit": "kg",  "price": 55000,  "stock_available": 250},
        ]
        for p in products_data:
            existing = db.query(Product).filter(Product.product_code == p["product_code"]).first()
            if not existing:
                obj = Product(**p)
                db.add(obj)
                db.flush()
                print(f"  [+] Product: {p['nama']}")
            else:
                print(f"  [=] Product exists: {p['nama']}")

        db.commit()
        print("\n✅ Seed selesai.")

        # ── CATATAN GEOFENCING TEST ───────────────────────────
        print("""
╔══════════════════════════════════════════════════════╗
║           KOORDINAT TEST GEOFENCING                  ║
╠══════════════════════════════════════════════════════╣
║ Toko BD Mie (CUST-002) — Gresik                      ║
║   latitude : -7.3416786                              ║
║   longitude: 112.6612152                             ║
║                                                      ║
║ Gunakan koordinat di atas ±50m untuk test order      ║
║ Contoh valid  : -7.3417000, 112.6612500              ║
║ Contoh invalid: -7.3500000, 112.6700000              ║
╚══════════════════════════════════════════════════════╝
        """)

    except Exception as e:
        db.rollback()
        print(f"❌ Seed gagal: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
