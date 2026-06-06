import hashlib


def hash_string(content: str) -> str:
    """SHA-256 hash of a string, returned as hex."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def hash_file(file_path) -> str:
    """SHA-256 hash of a file's contents. Falls back to empty hash on error."""
    h = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            # Read in chunks so large files don't use too much memory
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except (OSError, IOError):
        return hash_string("")


def make_component_hash(name: str, version: str) -> str:
    """
    Hash a package by name+version since we don't have the actual archive.
    Using name@version is deterministic — same input always gives same hash.
    """
    canonical = f"{name}@{version}"
    return hash_string(canonical)
