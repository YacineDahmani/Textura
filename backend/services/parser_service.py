import zipfile
import xml.etree.ElementTree as ET
import io
import logging

logger = logging.getLogger("textura.parser")

class ParserService:
    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        """
        Parses a .docx file and extracts plain text from its XML representation.
        No external libraries required.
        """
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                
                text_elements = []
                # OpenXML namespace for wordprocessing
                wp_ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
                
                # Find all paragraph elements <w:p>
                for paragraph in root.iter(f'{wp_ns}p'):
                    para_text = []
                    # Find all text elements <w:t>
                    for text in paragraph.iter(f'{wp_ns}t'):
                        if text.text:
                            para_text.append(text.text)
                    if para_text:
                        text_elements.append("".join(para_text))
                    else:
                        text_elements.append("")  # preserve paragraph breaks
                
                # Join paragraphs, keeping formatting clean
                return "\n".join(text_elements)
        except Exception as e:
            logger.error(f"Error parsing DOCX file: {e}")
            raise ValueError(f"Failed to parse Word Document (.docx): {str(e)}")

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        """
        Parses a .pdf file and extracts text page by page using pypdf.
        """
        try:
            import pypdf
        except ImportError:
            raise ImportError(
                "PDF parsing library 'pypdf' is not installed on the server. "
                "Please run: pip install pypdf"
            )
        
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_pages = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_pages.append(page_text)
            
            if not text_pages:
                raise ValueError("The PDF file appears to have no extractable text.")
                
            return "\n\n--- Page Break ---\n\n".join(text_pages)
        except Exception as e:
            logger.error(f"Error parsing PDF file: {e}")
            raise ValueError(f"Failed to parse PDF file: {str(e)}")

    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        """
        Extracts plain text from the uploaded file based on its extension.
        """
        lower_name = filename.lower()
        if lower_name.endswith('.docx'):
            return ParserService.parse_docx(file_bytes)
        elif lower_name.endswith('.pdf'):
            return ParserService.parse_pdf(file_bytes)
        elif lower_name.endswith(('.txt', '.html', '.css', '.js', '.json', '.xml', '.csv', '.md', '.yaml', '.yml', '.ts', '.tsx', '.jsx')):
            try:
                return file_bytes.decode('utf-8', errors='replace')
            except Exception as e:
                raise ValueError(f"Failed to decode text file as UTF-8: {str(e)}")
        else:
            # Fallback: try decoding as plain text
            try:
                return file_bytes.decode('utf-8')
            except Exception:
                raise ValueError("Unsupported or unreadable binary file format. Only PDF, Word, and text-based files are supported.")
