# sbomgen — SBOM CLI Scanner

**Member 1: CLI Scanner / Core Detection Module**

This is the first stage of the SBOM (Software Bill of Materials) generation pipeline.
It scans any software project folder, detects what technologies are in use,
parses dependency files, and produces a clean JSON output that Member 2 uses to
generate CycloneDX / SPDX SBOM documents.

---

## What this module does

```
Your project folder
        │
        ▼
┌───────────────────┐
│  1. Ecosystem     │  Detects: node / python / java / docker
│     Detection     │  by checking which dependency files exist
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  2. Dependency    │  Parses: package.json, package-lock.json,
│     Parsing       │  requirements.txt, pyproject.toml, pom.xml,
│                   │  build.gradle, Dockerfile, docker-compose.yml
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  3. PURL + Hash   │  Generates: pkg:npm/express@4.18.2
│     Generation    │  and SHA-256 hash for each component
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  4. Stack         │  Detects: React / Express.js / MongoDB etc.
│     Detection     │  by matching package names to known libraries
└────────┬──────────┘
         │
         ▼
  parsed_components.json  ──►  Member 2 (SBOM Builder)
```

---

## Folder structure

```
sbom-cli-scanner/
├── sbomgen/
│   ├── __init__.py          # Package metadata
│   ├── cli.py               # CLI entry point (Click commands)
│   ├── detector.py          # Ecosystem detection
│   ├── parsers.py           # All dependency file parsers
│   ├── purl_utils.py        # PURL (Package URL) generation
│   ├── hash_utils.py        # SHA-256 hash generation
│   └── stack_detector.py    # Frontend/backend/database stack detection

├── pyproject.toml           # Package config + dependencies
  # This file
```

---

## Prerequisites

- Python 3.11 or higher
- pip

Check your Python version:
```
python --version
```

---

## Setup (Windows)

Open Command Prompt or PowerShell in the `sbom-cli-scanner` folder:

```
# Step 1: Create a virtual environment (keeps dependencies isolated)
python -m venv venv

# Step 2: Activate the virtual environment
venv\Scripts\activate

# Step 3: Install the scanner and all its dependencies
pip install -e .

# Step 4: Verify installation
sbomgen --help
```

---

## Setup (Mac / Linux)

```bash
# Step 1: Create virtual environment
python3 -m venv venv

# Step 2: Activate it
source venv/bin/activate

# Step 3: Install
pip install -e .

# Step 4: Verify
sbomgen --help
```

---

## Usage

### Basic scan

Scan the included sample project:

```
sbomgen scan ./sample-project
```

This will:
1. Detect ecosystems (node, python, docker)
2. Parse all dependency files
3. Detect the stack (React + Express.js + MongoDB)
4. Write `parsed_components.json` in your current folder
5. Print a summary table in the terminal

### Specify output file

```
sbomgen scan ./my-project --output my-results.json
```

### Scan any real project

```
sbomgen scan C:\Users\you\projects\my-app --output sbom-input.json
```

### All available flags

```
sbomgen scan ./my-project \
  --output parsed_components.json \
  --upload \
  --api-key YOUR_API_KEY_HERE \
  --project my-app-name \
  --fail-on CRITICAL
```

| Flag | Description |
|------|-------------|
| `--output` / `-o` | Path for the output JSON file |
| `--upload` | (Placeholder) Upload to backend when ready |
| `--api-key` | (Placeholder) API key for backend upload |
| `--project` | (Placeholder) Project name tag |
| `--fail-on` | (Placeholder) Exit with error if severity found |

> `--upload`, `--api-key`, `--project`, and `--fail-on` are placeholders.
> They are accepted by the CLI but not yet implemented.
> Member 3 (vulnerability checker) and Member 4 (backend) will implement these.

---

## Supported ecosystems

| Ecosystem | Files Detected |
|-----------|---------------|
| Node.js / npm | `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Python / PyPI | `requirements.txt`, `pyproject.toml`, `Pipfile` |
| Java / Maven | `pom.xml` |
| Java / Gradle | `build.gradle`, `build.gradle.kts` |
| Docker | `Dockerfile`, `docker-compose.yml`, `compose.yml` |

---

## Detected stack signals

### Frontend
React, Next.js, Vue.js, Nuxt.js, Angular, Svelte, SvelteKit, Gatsby, Remix,
Astro, SolidJS, Vite, Alpine.js, Qwik, Lit, Ember.js

### Backend
Express.js, Fastify, Koa.js, NestJS, Hapi.js, Hono, ElysiaJS (Node.js)
Django, Flask, FastAPI, Starlette, Tornado, Sanic (Python)
Spring Boot, Spring MVC, Quarkus, Micronaut (Java)
Laravel, Symfony (PHP)

### Database
MongoDB, PostgreSQL, MySQL, MariaDB, SQLite, Redis, Memcached,
Elasticsearch, Neo4j, DynamoDB, Firestore, Cosmos DB, Supabase
Plus ORM detection: Sequelize, TypeORM, Prisma, SQLAlchemy, Hibernate

---

## Sample output (parsed_components.json)

```json
{
  "project_name": "sample-project",
  "detected_ecosystems": ["node", "python", "docker"],
  "frontend": "React",
  "backend": "Express.js",
  "database": "MongoDB",
  "component_count": 29,
  "components": [
    {
      "name": "express",
      "version": "4.18.2",
      "ecosystem": "npm",
      "purl": "pkg:npm/express@4.18.2",
      "license": "NOASSERTION",
      "hash": "sha256:b8dd1b13cad7156f3f557cbccb1307ebc4f98a5a17e0bca0e76fc798612f5ef7"
    },
    {
      "name": "react",
      "version": "18.2.0",
      "ecosystem": "npm",
      "purl": "pkg:npm/react@18.2.0",
      "license": "NOASSERTION",
      "hash": "sha256:27e03f4ce1585aa4a36d3df5829aac7d10573dff5874ff23ee328c6a69a333e4"
    },
    {
      "name": "fastapi",
      "version": "0.103.1",
      "ecosystem": "pypi",
      "purl": "pkg:pypi/fastapi@0.103.1",
      "license": "NOASSERTION",
      "hash": "sha256:29abddb84bc1c6bef732f176b15e881ddf7d83ed75b6fa7c2b58b1addb90d968"
    },
    {
      "name": "postgres",
      "version": "15-alpine",
      "ecosystem": "docker",
      "purl": "pkg:docker/postgres@15-alpine",
      "license": "NOASSERTION",
      "hash": "sha256:2ea1c343371ea51bfa79e9414ab9a06b2feb65f4bef203feb155c83b728b9253"
    }
  ]
}
```

---

## How this connects to other members

```
Member 1 (You)          Member 2                Member 3              Member 4
CLI Scanner    ──►  SBOM Builder         Vulnerability         Backend API
                    CycloneDX/SPDX       Checker               Upload + Store
                    converter            uses PURL to          receives JSON
                    reads our JSON       look up CVEs          from --upload
```

The `parsed_components.json` file is the handoff artifact.
Member 2 reads this file and converts it to a standard SBOM format.
The PURL field in each component is what makes this possible — it's the
universal identifier that SBOM tools, vulnerability databases (OSV, NVD),
and package registries all understand.

---

## How PURL works

A Package URL (PURL) uniquely identifies a package across ecosystems:

```
pkg : npm   / express   @ 4.18.2
 │     │         │          │
 │  ecosystem  name       version
 │
"pkg" prefix (always)
```

More examples:
- `pkg:pypi/requests@2.31.0`
- `pkg:maven/org.springframework.boot/spring-boot@3.1.0`
- `pkg:docker/postgres@15-alpine`

---

## Running the tests (optional)

```
pip install pytest
pytest
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `click` | CLI framework |
| `rich` | Colorful terminal tables and output |
| `packageurl-python` | Correct PURL generation |
| `pyyaml` | Parse docker-compose.yml |
| `requests` | Future: upload to backend |
| `tomli` | TOML parsing fallback (Python < 3.11) |
