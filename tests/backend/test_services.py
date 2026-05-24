import pytest
from services.encode_service import EncodeService
from services.hash_service import HashService
from services.text_service import TextService

def test_base64_encode_decode():
    plain = "Hello Antigravity!"
    
    # Standard
    encoded = EncodeService.base64_encode(plain, url_safe=False)
    assert encoded == "SGVsbG8gQW50aWdyYXZpdHkh"
    decoded = EncodeService.base64_decode(encoded, url_safe=False)
    assert decoded == plain

    # URL Safe
    url_safe_plain = "Hello? Antigravity/Test+1"
    encoded_url = EncodeService.base64_encode(url_safe_plain, url_safe=True)
    assert "/" not in encoded_url and "+" not in encoded_url
    decoded_url = EncodeService.base64_decode(encoded_url, url_safe=True)
    assert decoded_url == url_safe_plain

def test_hash_generation():
    text = "textura"
    hashes = HashService.generate_all_hashes(text)
    
    assert "md5" in hashes
    assert "sha1" in hashes
    assert "sha256" in hashes
    assert "sha512" in hashes

    # textura MD5 is "b9fb4603bd3a330765dc84c73fe4976b"
    assert hashes["md5"] == "b9fb4603bd3a330765dc84c73fe4976b"
    assert len(hashes["sha256"]) == 64

def test_regex_matching_and_replace():
    text = "The quick brown fox jumps over the lazy dog"
    
    # Test Mode (Match)
    res_match = TextService.test_regex(text, r"(quick|lazy) (\w+)", "", "i", "test")
    assert len(res_match["matches"]) == 2
    assert res_match["matches"][0]["text"] == "quick brown"
    assert res_match["matches"][0]["groups"] == ["quick", "brown"]
    assert res_match["matches"][1]["text"] == "lazy dog"
    assert res_match["matches"][1]["groups"] == ["lazy", "dog"]
    
    # Replace Mode
    res_replace = TextService.test_regex(text, r"(brown|lazy)", "color", "i", "replace")
    assert res_replace["output"] == "The quick color fox jumps over the color dog"

def test_regex_invalid():
    with pytest.raises(ValueError) as exc:
        TextService.test_regex("text", r"[unclosed-class", "", "", "test")
    assert "Invalid Regular Expression" in str(exc.value)