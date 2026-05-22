import os
import pytest
from fastapi.testclient import TestClient

# Import app to test
from main import app
from limiter import limiter

client = TestClient(app)

def test_pydantic_input_size_limit_success():
    """
    Test that inputs under/at 500,000 characters pass Pydantic validation.
    """
    payload = {
        "input": "A" * 500_000,
        "options": {"mode": "encode", "urlSafe": False}
    }
    response = client.post("/api/encode/base64", json=payload)
    # This should pass Pydantic validation (it will return 200)
    assert response.status_code == 200

def test_pydantic_input_size_limit_exceeded():
    """
    Test that inputs exceeding 500,000 characters are rejected with a 422 validation error.
    """
    payload = {
        "input": "A" * 500_001,
        "options": {"mode": "encode", "urlSafe": False}
    }
    response = client.post("/api/encode/base64", json=payload)
    # This should be rejected by Pydantic (status 422)
    assert response.status_code == 422
    
    # Check that other routers with input limits also reject large inputs
    payload_hash = {
        "input": "A" * 500_001,
        "options": {}
    }
    response_hash = client.post("/api/hash/generate", json=payload_hash)
    assert response_hash.status_code == 422

    payload_text = {
        "input": "A" * 500_001,
        "options": {"pattern": "A", "mode": "test"}
    }
    response_text = client.post("/api/text/regex", json=payload_text)
    assert response_text.status_code == 422

def test_cors_origin_dynamic():
    """
    Test that the CORS headers are dynamic and reflect ALLOWED_ORIGIN.
    """
    # Origin matching configured allowed origins
    headers = {"Origin": "http://localhost:5173"}
    response = client.options("/api/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

    # Origin NOT matching allowed origins (should not return access-control-allow-origin)
    headers_invalid = {"Origin": "https://malicious-site.com"}
    response_invalid = client.options("/api/health", headers=headers_invalid)
    assert "access-control-allow-origin" not in response_invalid.headers

def test_rate_limiting():
    """
    Test rate limiting on the hash/generate endpoint (limit 30/minute).
    Since we are using an in-memory limiter, rapid subsequent calls should trigger a 429.
    """
    # Reset limiter for this test
    limiter.reset()

    payload = {"input": "test", "options": {}}
    
    # Send requests in rapid succession
    limit_hit = False
    for _ in range(40):
        response = client.post("/api/hash/generate", json=payload)
        if response.status_code == 429:
            limit_hit = True
            assert "Rate limit exceeded" in response.json().get("error", "")
            break
            
    assert limit_hit, "Rate limiting did not trigger a 429 after 40 rapid requests"
