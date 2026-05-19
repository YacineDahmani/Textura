from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from services.text_service import TextService

router = APIRouter(prefix="/text", tags=["text"])

class TransformRequest(BaseModel):
    input: str
    options: Dict[str, Any] = Field(default_factory=dict)

@router.post("/regex")
def regex_endpoint(payload: TransformRequest):
    input_str = payload.input
    options = payload.options
    
    pattern = options.get("pattern", "")
    replace_pattern = options.get("replacePattern", "")
    flags = options.get("flags", "")
    mode = options.get("mode", "test")
    
    try:
        res = TextService.test_regex(input_str, pattern, replace_pattern, flags, mode)
        return {
            "output": res["output"],
            "meta": {
                "matches": res["matches"],
                "mode": mode,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
