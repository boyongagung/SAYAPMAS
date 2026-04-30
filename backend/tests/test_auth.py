def test_register_success(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "usertest",
            "email": "user@test.com",
            "password": "password123",
            "role": "salesman",
        },
    )
    assert res.status_code == 201
    assert res.json()["success"] is True
    assert res.json()["data"]["username"] == "usertest"


def test_register_duplicate_username(client):
    payload = {
        "username": "dupuser",
        "email": "dup@test.com",
        "password": "pass123",
        "role": "salesman",
    }
    client.post("/api/v1/auth/register", json=payload)
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 409


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "loginuser",
            "email": "login@test.com",
            "password": "password123",
            "role": "salesman",
        },
    )
    res = client.post(
        "/api/v1/auth/login",
        json={
            "username": "loginuser",
            "password": "password123",
        },
    )
    assert res.status_code == 200
    assert "access_token" in res.json()["data"]


def test_login_wrong_password(client):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "username": "loginuser",
            "password": "wrongpass",
        },
    )
    assert res.status_code == 401


def test_me_authenticated(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["username"] == "testadmin"


def test_me_unauthenticated(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code in (401, 403)
