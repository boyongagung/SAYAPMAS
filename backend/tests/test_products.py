PRODUCT_PAYLOAD = {
    "product_code": "PRD-001",
    "nama": "Kopi Robusta",
    "unit": "kg",
    "price": "50000.00",
    "stock_available": 100,
}


def test_create_product(client):
    res = client.post("/api/v1/products/", json=PRODUCT_PAYLOAD)
    assert res.status_code == 201
    assert res.json()["data"]["product_code"] == "PRD-001"


def test_create_product_duplicate_code(client):
    client.post("/api/v1/products/", json=PRODUCT_PAYLOAD)
    res = client.post("/api/v1/products/", json=PRODUCT_PAYLOAD)
    assert res.status_code == 409


def test_list_products(client):
    res = client.get("/api/v1/products/")
    assert res.status_code == 200
    assert isinstance(res.json()["data"], list)


def test_get_product_not_found(client):
    res = client.get("/api/v1/products/99999")
    assert res.status_code == 404
