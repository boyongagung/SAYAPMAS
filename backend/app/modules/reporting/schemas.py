from pydantic import BaseModel
from typing import List


class SalesSummary(BaseModel):
    mtd_sales: float
    salesman_performance: List[dict]


class ProductEvaluation(BaseModel):
    product_name: str
    total_qty: int
    total_revenue: float


class ReturnSummary(BaseModel):
    total_returns: int
