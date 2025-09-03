import fitz
# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'pdf', 'mp3'}


def allowed_file(filename):
    """
    Checks if uploaded file has an allowed extension.

    Args:
    filename (str): Name of the uploaded file.

    Returns:
    bool: True if file extension is allowed, else False.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Extracts text content from PDF file bytes.

    Args:
    file_bytes (bytes): PDF file content.

    Returns:
    str: Extracted plain text from PDF.
    """

    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
            text += "\n\n"
    return text.strip()