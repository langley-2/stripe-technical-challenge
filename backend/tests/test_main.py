from fastapi.testclient import TestClient

from main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

# write tests here

# def test_root(): response = client.get("/")

def test_get_items():
    response = client.get("/api/items")
    assert response.status_code == 200
    assert response.json() == {
        '1': {'title': 'The Art of Doing Science and Engineering', 'amount': 2300},
        '2': {'title': 'The Making of Prince of Persia: Journals 1985-1993', 'amount': 2500},
        '3': {'title': 'Working in Public: The Making and Maintenance of Open Source', 'amount': 2800},
    }

def test_get_item():
    response = client.get("/api/items/1")
    assert response.status_code == 200
    assert response.json() == {'title': 'The Art of Doing Science and Engineering', 'amount': 2300}


def test_invalid_item():
    response = client.get("/api/items/abc")
    assert response.status_code == 404
    assert response.json() == {"detail" :"Not Found"}


def test_create_payment_intent():
    mock_intent = MagicMock()
    mock_intent.id = "pi_test_123"
    mock_intent.client_secret = "pi_test_123_secret_abc"

    with patch("main.stripe.PaymentIntent.create", return_value=mock_intent):
        response = client.post("/api/create-payment-intent", json={"item_id": "1"})

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "client_secret" in data

def test_invalid_payment_intent():
    response = client.post("/api/create-payment-intent", json={"item_id": "abc"})
    assert response.status_code == 404
    assert response.json() == {
    "detail": "Not Found"
}
    

def test_payment_intent_status():
    mock_status = MagicMock()
    mock_status.id = "pi_test"
    mock_status.status = "succeeded"
    mock_status.amount = 2300
    with patch("main.stripe.PaymentIntent.retrieve", return_value = mock_status):
        response = client.get("/api/check-payment-intent-status/pi_test")
    
    assert response.status_code == 200
    assert response.json() == {"id": "pi_test", "status": "succeeded", "amount": 2300}