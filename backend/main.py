from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import text, encode, hash, parser

app = FastAPI(
    title="Textura API",
    description="Developer-first text workbench backend service for encoding, hashing, and regex mapping.",
    version="1.0.0"
)

# Configure CORS to allow the frontend local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
