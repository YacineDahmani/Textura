import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from limiter import limiter
from routers import text, encode, hash, parser

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Textura API",
    description="Developer-first text workbench backend service for encoding, hashing, and regex mapping.",
    version="1.0.0"
)

# Register slowapi rate limiter and its exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS using environment variables
allowed_origins_raw = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
# Support comma-separated strings for multiple origins
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Modules
app.include_router(text.router, prefix="/api")
app.include_router(encode.router, prefix="/api")
app.include_router(hash.router, prefix="/api")
app.include_router(parser.router, prefix="/api")

@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
