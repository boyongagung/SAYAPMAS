def test_create_area(client):
    res = client.post("/api/v1/areas/", json={"name": "Jakarta Selatan"})
    assert res.status_code == 201
    assert res.json()["data"]["name"] == "Jakarta Selatan"


def test_list_areas(client):
    res = client.get("/api/v1/areas/")
    assert res.status_code == 200
    assert isinstance(res.json()["data"], list)


def test_get_area_not_found(client):
    res = client.get("/api/v1/areas/99999")
    assert res.status_code == 404
    assert res.json()["success"] is False
