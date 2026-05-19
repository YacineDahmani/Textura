from fastapi import FastAPI


app = FastAPI(title="Textura API", version="0.0.1")


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
