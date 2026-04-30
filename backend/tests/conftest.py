import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.database.session import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


class NestedTransaction:
    """Wrapper agar begin_nested() kompatibel dengan with self.db.begin()"""

    def __init__(self, session):
        self._session = session
        self._nested = None

    def __enter__(self):
        self._nested = self._session.begin_nested()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self._nested.rollback()
        else:
            self._nested.commit()
        return False

    def rollback(self):
        if self._nested:
            self._nested.rollback()

    def commit(self):
        if self._nested:
            self._nested.commit()


@pytest.fixture
def db():
    session = TestingSessionLocal()
    session.begin()

    session.begin = lambda **kw: NestedTransaction(session)

    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "testadmin",
            "email": "admin@test.com",
            "password": "password123",
            "role": "admin",
        },
    )
    res = client.post(
        "/api/v1/auth/login",
        json={
            "username": "testadmin",
            "password": "password123",
        },
    )
    token = res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
