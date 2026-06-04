from packageurl import PackageURL


def build_purl(name: str, version: str, ecosystem: str, namespace: str = None) -> str:
    """
    Build a PURL (Package URL) string for a component.
    PURL is the standard identifier used in SBOM formats — Member 2 needs this.
    Format: pkg:<type>/<namespace>/<name>@<version>
    """

    # Our internal ecosystem names differ from PURL types (e.g. "node" → "npm")
    purl_type_map = {
        "npm":    "npm",
        "node":   "npm",
        "pypi":   "pypi",
        "python": "pypi",
        "maven":  "maven",
        "java":   "maven",
        "docker": "docker",
        "cargo":  "cargo",
        "gem":    "gem",
        "nuget":  "nuget",
    }

    purl_type = purl_type_map.get(ecosystem.lower(), ecosystem.lower())

    # Strip version range symbols like ^ and ~ so the PURL has a clean version
    clean_version = _clean_version(version)

    try:
        purl = PackageURL(
            type=purl_type,
            namespace=namespace,  # used for Maven groupId
            name=name,
            version=clean_version if clean_version else None,
        )
        return str(purl)
    except Exception:
        # Manual fallback if the library fails for some reason
        if namespace:
            return f"pkg:{purl_type}/{namespace}/{name}@{clean_version}"
        return f"pkg:{purl_type}/{name}@{clean_version}"


def _clean_version(version: str) -> str:
    """
    Strip range prefixes so PURL has an exact version.
    npm uses ^ and ~, pip uses >= and ==, etc.
    e.g. "^4.18.2" → "4.18.2", ">=1.0.0" → "1.0.0"
    """
    if not version:
        return ""

    version = version.strip()

    for prefix in [">=", "<=", "!=", "==", "~=", "^", "~", ">", "<", "="]:
        if version.startswith(prefix):
            version = version[len(prefix):].strip()

    # Remove trailing wildcards like "4.x" or "4.*"
    version = version.rstrip(".*x")

    return version.strip()
