import hashlib

class HashService:
    @staticmethod
    def generate_all_hashes(text: str) -> dict[str, str]:
        text_bytes = text.encode("utf-8")
        return {
            "md5": hashlib.md5(text_bytes).hexdigest(),
            "sha1": hashlib.sha1(text_bytes).hexdigest(),
            "sha256": hashlib.sha256(text_bytes).hexdigest(),
            "sha512": hashlib.sha512(text_bytes).hexdigest(),
        }
