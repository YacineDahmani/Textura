from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from services.parser_service import ParserService
from limiter import limiter

router = APIRouter(prefix="/parser", tags=["parser"])

# Limit file uploads to 5MB maximum
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

@router.post("/parse-file")
@limiter.limit("20/minute")
async def parse_file_endpoint(request: Request, file: UploadFile = File(...)):
    # Read the file contents
    file_bytes = await file.read()
    
    # Enforce maximum file size
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 5MB."
        )
        
    try:
        extracted_text = ParserService.extract_text(file_bytes, file.filename)
        return {
            "text": extracted_text,
            "filename": file.filename,
            "size": len(file_bytes)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while parsing the file: {str(e)}"
        )
