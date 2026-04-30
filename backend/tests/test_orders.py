import pytest


@pytest.fixture
def setup_order_data(client):
    client.post("/api/v1/areas/", json={"name": "Area Test"})
    client.post(
        "/api/v1/salesmen/", json={"name": "Salesman Test", "phone": "081234567890"}
    )
    client.post(
        "/api/v1/customers/",
        json={
            "customer_code": "CUST-001",
            "nama": "Toko Maju",
            "id_area": 1,
            "id_salesman": 1,
            "latitude": -6.2,
            "longitude": 106.8,
        },
    )
    client.post(
        "/api/v1/products/",
        json={
            "product_code": "PRD-ORD-001",
            "nama": "Kopi Test",
            "unit": "kg",
            "price": "50000.00",
            "stock_available": 100,
        },
    )


def test_create_order_no_geofence(client, setup_order_data):
    res = client.post(
        "/api/v1/orders/",
        json={
            "id_customer": 1,
            "id_salesman": 1,
            "items": [{"id_product": 1, "qty": 5}],
        },
    )
    assert res.status_code == 201
    assert res.json()["data"]["status"] == "pending"
    assert res.json()["data"]["total_amount"] == "250000.00"


def test_create_order_insufficient_stock(client, setup_order_data):
    res = client.post(
        "/api/v1/orders/",
        json={
            "id_customer": 1,
            "id_salesman": 1,
            "items": [{"id_product": 1, "qty": 9999}],
        },
    )
    assert res.status_code == 422


def test_order_status_transition(client, setup_order_data):
    res = client.post(
        "/api/v1/orders/",
        json={
            "id_customer": 1,
            "id_salesman": 1,
            "items": [{"id_product": 1, "qty": 2}],
        },
    )
    order_id = res.json()["data"]["id"]

    res = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "confirmed"}
    )
    assert res.status_code == 200
    assert res.json()["data"]["status"] == "confirmed"


def test_order_invalid_status_transition(client, setup_order_data):
    res = client.post(
        "/api/v1/orders/",
        json={
            "id_customer": 1,
            "id_salesman": 1,
            "items": [{"id_product": 1, "qty": 1}],
        },
    )
    order_id = res.json()["data"]["id"]
    res = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "delivered"}
    )
    assert res.status_code == 422
