import pytest
import zipfile
import io
from services.parser_service import ParserService

def test_parse_docx_success():
    """
    Test that the self-contained XML DOCX parser successfully extracts paragraphs
    from an in-memory zip archive representing a Word Document.
    """
    docx_io = io.BytesIO()
    with zipfile.ZipFile(docx_io, 'w') as docx:
        # Mock the OpenXML Word document structure
        document_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
                <w:p>
                    <w:r>
                        <w:t>Hello world from docx parser!</w:t>
                    </w:r>
                </w:p>
                <w:p>
                    <w:r>
                        <w:t>Second paragraph text.</w:t>
                    </w:r>
                </w:p>
            </w:body>
        </w:document>"""
        docx.writestr('word/document.xml', document_xml)
        
    file_bytes = docx_io.getvalue()
    text = ParserService.parse_docx(file_bytes)
    
    assert "Hello world from docx parser!" in text
    assert "Second paragraph text." in text
    assert text == "Hello world from docx parser!\nSecond paragraph text."

def test_parse_docx_invalid():
    """
    Test that invalid zip archives fail gracefully with a descriptive ValueError.
    """
    with pytest.raises(ValueError) as exc:
        ParserService.parse_docx(b"not-a-zip-file")
    assert "Failed to parse Word Document" in str(exc.value)

def test_extract_text_text_files():
    """
    Test that text-based files decode and read successfully.
    """
    plain_text = "This is some plain text content."
    res = ParserService.extract_text(plain_text.encode('utf-8'), "test.txt")
    assert res == plain_text
    
    html_content = "<html><body>Hello</body></html>"
    res_html = ParserService.extract_text(html_content.encode('utf-8'), "index.html")
    assert res_html == html_content
    
    js_content = "console.log('hello');"
    res_js = ParserService.extract_text(js_content.encode('utf-8'), "app.js")
    assert res_js == js_content

def test_extract_text_unsupported():
    """
    Test that unsupported binary formats throw an error message.
    """
    with pytest.raises(ValueError) as exc:
        ParserService.extract_text(b"\x00\x01\x02\x03\x04\xff", "image.png")
    assert "Unsupported or unreadable binary" in str(exc.value)
