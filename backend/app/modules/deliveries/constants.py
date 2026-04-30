DELIVERY_CODE_PREFIX: str = "DLV"
DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100

# Status transition map
STATUS_TRANSITIONS: dict[str, list[str]] = {
    "assigned": ["in_transit", "failed", "delayed"],
    "in_transit": ["delivered", "failed", "delayed"],
    "delayed": ["in_transit", "delivered", "failed"],
    "delivered": [],
    "failed": [],
}

# Mapping delivery status → order status saat sync
DELIVERY_TO_ORDER_STATUS: dict[str, str] = {
    "in_transit": "in_transit",
    "delivered": "delivered",
    "failed": "cancelled",  # Atau tetap 'confirmed' tergantung kebijakan
    "delayed": "in_transit",
}
