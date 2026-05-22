from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Dict, Any
from services.encode_service import EncodeService
from limiter import limiter

router = APIRouter(prefix="/encode", tags=["encode"])

class TransformRequest(BaseModel):
    input: str = Field(..., max_length=500_000)
    options: Dict[str, Any] = Field(default_factory=dict)

@router.post("/base64")
@limiter.limit("100/minute")
def base64_endpoint(request: Request, payload: TransformRequest):
    input_str = payload.input
    options = payload.options
    
    mode = options.get("mode", "encode")
    url_safe = options.get("urlSafe", False)
    
    try:
        if mode == "encode":
            output = EncodeService.base64_encode(input_str, url_safe)
        else:
            output = EncodeService.base64_decode(input_str, url_safe)
        return {"output": output, "meta": {"mode": mode, "urlSafe": url_safe}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Base64 Error: {str(e)}")
