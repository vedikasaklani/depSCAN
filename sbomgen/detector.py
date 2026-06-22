from pathlib import Path


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
    """
    Recursively search for supported dependency files
    and return detected ecosystems.
    """

    detected = []

    for filename, ecosystem in ECOSYSTEM_FILE_MAP.items():

        matches = list(folder.rglob(filename))

        if matches and ecosystem not in detected:
            detected.append(ecosystem)

    return detected



