import requests

def get_available_models():
    """
    Fetches list of available local models from Ollama.

    Returns:
    list: Names of available local models.
    """
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        return sorted(set(m['name'].split(":")[0] for m in res.json().get("models", [])))
    except:
        return []