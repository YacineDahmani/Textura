import base64

class EncodeService:
    @staticmethod
    def base64_encode(text: str, url_safe: bool = False) -> str:
        text_bytes = text.encode("utf-8")
        if url_safe:
            encoded = base64.urlsafe_b64encode(text_bytes)
        else:
            encoded = base64.b64encode(text_bytes)
        return encoded.decode("utf-8")

    @staticmethod
    def base64_decode(text: str, url_safe: bool = False) -> str:
        # Standardize padding for base64
        padded_text = text + "=" * ((4 - len(text) % 4) % 4)
        text_bytes = padded_text.encode("utf-8")
        if url_safe:
            decoded = base64.urlsafe_b64decode(text_bytes)
        else:
            decoded = base64.b64decode(text_bytes)
        return decoded.decode("utf-8")
