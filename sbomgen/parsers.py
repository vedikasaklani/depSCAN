import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from sbomgen.purl_utils import build_purl
from sbomgen.hash_utils import make_component_hash


def parse_all(folder: Path, ecosystems: list[str]) -> list[dict]:
    """Run all parsers for detected ecosystems and return a deduplicated component list."""
    all_components = []
    seen = set()

    for ecosystem in ecosystems:
        parser_fn = PARSER_MAP.get(ecosystem)
        if parser_fn:
            components = parser_fn(folder)
            for comp in components:
                # Skip if we already have this exact name+version+ecosystem combo
                dedup_key = f"{comp['name']}@{comp['version']}@{comp['ecosystem']}"
                if dedup_key not in seen:
                    seen.add(dedup_key)
                    all_components.append(comp)

    return all_components


def _make_component(name: str, version: str, ecosystem: str,
                    license_str: str = "NOASSERTION",
                    namespace: str = None) -> dict:
    """Build a single component dict in the format Member 2 expects."""
    purl = build_purl(name, version, ecosystem, namespace)
    hash_val = "sha256:" + make_component_hash(name, version)

    return {
        "name":      name,
        "version":   version,
        "ecosystem": ecosystem,
        "purl":      purl,
        "license":   license_str if license_str else "NOASSERTION",
        "hash":      hash_val,
    }


def parse_node(folder: Path) -> list[dict]:
    # Prefer package-lock.json over package.json — it has exact installed versions
    lock_file = folder / "package-lock.json"
    pkg_file  = folder / "package.json"

    if lock_file.exists():
        return _parse_package_lock(lock_file)
    elif pkg_file.exists():
        return _parse_package_json(pkg_file)
    return []


def _parse_package_lock(lock_path: Path) -> list[dict]:
    components = []

    try:
        data = json.loads(lock_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        print(f"  [Warning] Could not read package-lock.json: {e}")
        return []

    packages = data.get("packages", {})
    for pkg_path_key, pkg_info in packages.items():
        if not pkg_path_key:
            continue

        # Strip "node_modules/" prefix to get the real package name
        name = pkg_path_key.replace("node_modules/", "")

        # Nested paths like "node_modules/x/node_modules/y" — take the last part
        if "node_modules/" in name:
            name = name.split("node_modules/")[-1]

        version = pkg_info.get("version", "")
        if not name or not version:
            continue

        license_val = pkg_info.get("license", "NOASSERTION")
        if isinstance(license_val, list):
            license_val = " OR ".join(license_val)

        components.append(_make_component(
            name=name,
            version=version,
            ecosystem="npm",
            license_str=str(license_val) if license_val else "NOASSERTION",
        ))

    # Fallback for older npm v1 lockfile format
    if not components:
        deps = data.get("dependencies", {})
        for name, info in deps.items():
            version = info.get("version", "")
            if name and version:
                components.append(_make_component(name=name, version=version, ecosystem="npm"))

    return components


def _parse_package_json(pkg_path: Path) -> list[dict]:
    """Fallback when no lock file exists. Versions here are ranges like ^4.18.2."""
    components = []

    try:
        data = json.loads(pkg_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        print(f"  [Warning] Could not read package.json: {e}")
        return []

    all_deps = {}
    all_deps.update(data.get("dependencies", {}))
    all_deps.update(data.get("devDependencies", {}))
    all_deps.update(data.get("peerDependencies", {}))

    for name, version in all_deps.items():
        clean_version = str(version).lstrip("^~>=<").strip()

        components.append(_make_component(
            name=name,
            version=clean_version,
            ecosystem="npm"
    ))

    return components


def parse_python(folder: Path) -> list[dict]:
    components = []

    if (folder / "requirements.txt").exists():
        components.extend(_parse_requirements_txt(folder / "requirements.txt"))

    if (folder / "pyproject.toml").exists():
        components.extend(_parse_pyproject_toml(folder / "pyproject.toml"))

    if (folder / "Pipfile").exists():
        components.extend(_parse_pipfile(folder / "Pipfile"))

    return components


def _parse_requirements_txt(req_path: Path) -> list[dict]:
    components = []

    try:
        lines = req_path.read_text(encoding="utf-8").splitlines()
    except OSError as e:
        print(f"  [Warning] Could not read requirements.txt: {e}")
        return []

    for line in lines:
        line = line.strip()

        # Skip blank lines, comments, and -r/-e flags
        if not line or line.startswith("#") or line.startswith("-"):
            continue

        # Strip inline comments
        if " #" in line:
            line = line[:line.index(" #")].strip()

        match = re.match(
            r"^([A-Za-z0-9_.\-]+)\s*([><=!~^]+)\s*([A-Za-z0-9_.*+\-]+).*$",
            line
        )
        if match:
            name    = match.group(1).strip()
            version = match.group(3).strip()
        else:
            # No version — just grab the name (handles "requests[security]" too)
            name = re.split(r"[><=!\[\s]", line)[0].strip()
            version = ""

        name = name.lower().replace("_", "-")

        if name:
            components.append(_make_component(name=name, version=version, ecosystem="pypi"))

    return components


def _parse_pyproject_toml(pyproject_path: Path) -> list[dict]:
    components = []

    try:
        content = pyproject_path.read_text(encoding="utf-8")
    except OSError:
        return []

    # tomllib is built in from Python 3.11; fall back to tomli package if older
    try:
        import tomllib
        data = tomllib.loads(content)
    except ImportError:
        try:
            import tomli as tomllib
            data = tomllib.loads(content)
        except ImportError:
            return _parse_pyproject_toml_regex(content)

    # PEP 621 format: [project] dependencies
    pep621_deps = data.get("project", {}).get("dependencies", [])
    for dep in pep621_deps:
        name, version = _split_pep508(dep)
        if name:
            components.append(_make_component(name, version, "pypi"))

    # Poetry format: [tool.poetry.dependencies]
    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    for pkg_name, version_info in poetry_deps.items():
        if pkg_name.lower() == "python":
            continue  # skip the Python version constraint itself
        if isinstance(version_info, str):
            version = version_info.lstrip("^~>=<")
        elif isinstance(version_info, dict):
            version = version_info.get("version", "").lstrip("^~>=<")
        else:
            version = ""
        name = pkg_name.lower().replace("_", "-")
        components.append(_make_component(name, version, "pypi"))

    return components


def _split_pep508(dep_str: str):
    """Split 'requests>=2.31.0' into ('requests', '2.31.0')."""
    dep_str = dep_str.strip()
    match = re.match(r"^([A-Za-z0-9_.\-]+)\s*[><=!~^]+\s*([A-Za-z0-9_.*+\-]+)", dep_str)
    if match:
        return match.group(1).lower().replace("_", "-"), match.group(2)
    name = re.split(r"[><=!\[\s]", dep_str)[0].strip().lower().replace("_", "-")
    return name, ""


def _parse_pyproject_toml_regex(content: str) -> list[dict]:
    """Regex fallback when no TOML library is installed."""
    components = []
    in_deps = False
    for line in content.splitlines():
        line = line.strip()
        if line in ('[project]', '[tool.poetry.dependencies]'):
            in_deps = True
            continue
        if in_deps and line.startswith("["):
            in_deps = False
        if in_deps:
            match = re.match(r'"?([A-Za-z0-9_.\-]+)"?\s*[>=<^~]+\s*"?([^"]+)"?', line)
            if match:
                name = match.group(1).lower().replace("_", "-")
                version = match.group(2).strip().lstrip("^~>=<\"'")
                if name != "python":
                    components.append(_make_component(name, version, "pypi"))
    return components


def _parse_pipfile(pipfile_path: Path) -> list[dict]:
    components = []
    try:
        content = pipfile_path.read_text(encoding="utf-8")
    except OSError:
        return []

    in_section = False
    for line in content.splitlines():
        line = line.strip()
        if line in ("[packages]", "[dev-packages]"):
            in_section = True
            continue
        if line.startswith("[") and in_section:
            in_section = False
        if in_section and "=" in line and not line.startswith("#"):
            parts = line.split("=", 1)
            name = parts[0].strip().strip('"').lower().replace("_", "-")
            version = parts[1].strip().strip('"\'*').lstrip("^~>=<")
            if name:
                components.append(_make_component(name, version, "pypi"))

    return components


def parse_java(folder: Path) -> list[dict]:
    components = []

    if (folder / "pom.xml").exists():
        components.extend(_parse_pom_xml(folder / "pom.xml"))
    if (folder / "build.gradle").exists():
        components.extend(_parse_build_gradle(folder / "build.gradle"))
    if (folder / "build.gradle.kts").exists():
        components.extend(_parse_build_gradle(folder / "build.gradle.kts"))

    return components


def _parse_pom_xml(pom_path: Path) -> list[dict]:
    components = []

    try:
        tree = ET.parse(pom_path)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"  [Warning] Could not parse pom.xml: {e}")
        return []

    # Maven XML may or may not have a namespace — handle both
    ns_match = re.match(r"\{(.+?)\}", root.tag)
    ns = f"{{{ns_match.group(1)}}}" if ns_match else ""

    def tag(name):
        return f"{ns}{name}"

    for dep in root.iter(tag("dependency")):
        group_id    = dep.findtext(tag("groupId"), "").strip()
        artifact_id = dep.findtext(tag("artifactId"), "").strip()
        version     = dep.findtext(tag("version"), "").strip()

        if artifact_id:
            # Skip Maven property references like ${project.version} — we can't resolve them
            if version.startswith("${"):
                version = ""

            components.append(_make_component(
                name=artifact_id,
                version=version,
                ecosystem="maven",
                namespace=group_id or None,
            ))

    return components


def _parse_build_gradle(gradle_path: Path) -> list[dict]:
    components = []

    try:
        content = gradle_path.read_text(encoding="utf-8")
    except OSError:
        return []

    pattern = re.compile(
        r"""(?:implementation|api|compileOnly|runtimeOnly|testImplementation|
             testRuntimeOnly|annotationProcessor|classpath)\s*
             [\(\s]["']
             ([A-Za-z0-9_.\-]+):([A-Za-z0-9_.\-]+):([A-Za-z0-9_.\-]+)
             ["'][\)]?""",
        re.VERBOSE,
    )

    for match in pattern.finditer(content):
        components.append(_make_component(
            name=match.group(2),
            version=match.group(3),
            ecosystem="maven",
            namespace=match.group(1),
        ))

    return components


def parse_docker(folder: Path) -> list[dict]:
    components = []

    if (folder / "Dockerfile").exists():
        components.extend(_parse_dockerfile(folder / "Dockerfile"))

    for name in ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"]:
        if (folder / name).exists():
            components.extend(_parse_docker_compose(folder / name))
            break  # only read the first compose file found

    return components


def _parse_dockerfile(dockerfile_path: Path) -> list[dict]:
    components = []

    try:
        lines = dockerfile_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return []

    for line in lines:
        line = line.strip()
        match = re.match(r"^FROM\s+([^\s]+?)(?::([^\s]+))?\s*(?:AS\s+\S+)?$",
                         line, re.IGNORECASE)
        if match:
            image = match.group(1).strip()
            tag   = match.group(2).strip() if match.group(2) else "latest"

            # "scratch" is a Docker built-in keyword, not a real image
            if image.lower() == "scratch":
                continue

            # Strip digest suffix like "ubuntu@sha256:..."
            if "@" in image:
                image = image.split("@")[0]

            components.append(_make_component(name=image, version=tag, ecosystem="docker"))

    return components


def _parse_docker_compose(compose_path: Path) -> list[dict]:
    components = []

    try:
        content = compose_path.read_text(encoding="utf-8")
    except OSError:
        return []

    # Use PyYAML if available; otherwise fall back to regex
    try:
        import yaml
        data = yaml.safe_load(content)
        services = data.get("services", {})
        for svc_name, svc_config in services.items():
            if not isinstance(svc_config, dict):
                continue
            image = svc_config.get("image", "")
            if image:
                name, tag = _split_image_tag(image)
                components.append(_make_component(name=name, version=tag, ecosystem="docker"))
        return components
    except ImportError:
        pass
    except Exception:
        pass

    for line in content.splitlines():
        match = re.match(r"\s+image:\s+([^\s#]+)", line)
        if match:
            name, tag = _split_image_tag(match.group(1).strip())
            components.append(_make_component(name=name, version=tag, ecosystem="docker"))

    return components


def _split_image_tag(image_str: str):
    """Split 'postgres:15' into ('postgres', '15'). Default tag is 'latest'."""
    if ":" in image_str:
        parts = image_str.rsplit(":", 1)
        return parts[0], parts[1]
    return image_str, "latest"


PARSER_MAP = {
    "node":   parse_node,
    "python": parse_python,
    "java":   parse_java,
    "docker": parse_docker,
}
