from pathlib import Path


# Maps filenames to ecosystem names. Order matters — first match wins per ecosystem.
ECOSYSTEM_FILE_MAP = {
    "package.json":        "node",
    "package-lock.json":   "node",
    "yarn.lock":           "node",
    "pnpm-lock.yaml":      "node",
    "requirements.txt":    "python",
    "pyproject.toml":      "python",
    "Pipfile":             "python",
    "Pipfile.lock":        "python",
    "setup.py":            "python",
    "setup.cfg":           "python",
    "pom.xml":             "java",
    "build.gradle":        "java",
    "build.gradle.kts":    "java",
    "Dockerfile":          "docker",
    "dockerfile":          "docker",
    "docker-compose.yml":  "docker",
    "docker-compose.yaml": "docker",
    "compose.yml":         "docker",
    "compose.yaml":        "docker",
}


def detect_ecosystems(folder: Path) -> list[str]:
    """Check which known dependency files exist and return the ecosystem names."""
    detected = []

    for filename, ecosystem in ECOSYSTEM_FILE_MAP.items():
        file_path = folder / filename
        if file_path.exists() and ecosystem not in detected:
            detected.append(ecosystem)

    return detected
