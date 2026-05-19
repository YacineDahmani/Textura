from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from services.hash_service import HashService

router = APIRouter(prefix="/hash", tags=["hash"])

class TransformRequest(BaseModel):
    input: str
    options: Dict[str, Any] = Field(default_factory=dict)

@router.post("/generate")
def generate_hash_endpoint(payload: TransformRequest):
    input_str = payload.input
    try:
        hashes = HashService.generate_all_hashes(input_str)
        return {"output": hashes, "meta": {}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Hash Generation Error: {str(e)}")
