from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.modules.areas.routes import router as areas_router
from app.modules.auth.routes import router as auth_router
from app.modules.customers.routes import router as customers_router
from app.modules.deliveries.routes import router as deliveries_router
from app.modules.finance.routes import router as finance_router
from app.modules.orders.routes import router as orders_router
from app.modules.products.routes import router as products_router
from app.modules.salesmen.routes import router as salesmen_router
from app.shared.exceptions import register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="ERP Samas - Pak Boyong", lifespan=lifespan)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(areas_router)
app.include_router(salesmen_router)
app.include_router(customers_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(deliveries_router)
app.include_router(finance_router)


@app.get("/")
def root():
    return {"success": True, "message": "ERP Samas API is Running", "data": {}}
