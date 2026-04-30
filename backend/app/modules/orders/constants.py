ORDER_CODE_PREFIX: str = "ORD"
DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100
GEOFENCE_RADIUS_METER: float = 100.0

STATUS_TRANSITIONS: dict[str, list[str]] = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["in_transit", "cancelled"],
    "in_transit": ["delivered"],
    "delivered": [],
    "cancelled": [],
}
