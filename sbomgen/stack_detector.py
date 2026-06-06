import json
import re
from pathlib import Path


FRONTEND_SIGNALS = {
    # React family
    "react-dom":           "React",
    "react":               "React",
    "next":                "Next.js",
    "@remix-run":          "Remix",
    "gatsby":              "Gatsby",

    # Vue family
    "vue":                 "Vue.js",
    "nuxt":                "Nuxt.js",
    "@vue":                "Vue.js",

    # Angular
    "@angular/core":       "Angular",
    "@angular":            "Angular",

    # Svelte
    "svelte":              "Svelte",
    "@sveltejs/kit":       "SvelteKit",

    # Others
    "solid-js":            "SolidJS",
    "vite":                "Vite",
    "@vitejs":             "Vite",
    "@builder.io/qwik":    "Qwik",
    "lit":                 "Lit",
    "lit-element":         "Lit",
    "ember-source":        "Ember.js",
    "alpinejs":            "Alpine.js",
    "astro":               "Astro",
}

BACKEND_SIGNALS = {
    # Node.js
    "express":             "Express.js",
    "fastify":             "Fastify",
    "koa":                 "Koa.js",
    "@hapi/hapi":          "Hapi.js",
    "hapi":                "Hapi.js",
    "nestjs":              "NestJS",
    "@nestjs/core":        "NestJS",
    "adonisjs":            "AdonisJS",
    "hono":                "Hono",
    "elysia":              "ElysiaJS",

    # Python
    "django":              "Django",
    "flask":               "Flask",
    "fastapi":             "FastAPI",
    "starlette":           "Starlette",
    "tornado":             "Tornado",
    "sanic":               "Sanic",
    "falcon":              "Falcon",

    # Java
    "spring-boot":         "Spring Boot",
    "spring-webmvc":       "Spring MVC",
    "quarkus":             "Quarkus",
    "micronaut":           "Micronaut",

    # PHP
    "laravel":             "Laravel",
    "symfony":             "Symfony",

    # Ruby
    "rails":               "Ruby on Rails",
    "sinatra":             "Sinatra",

    # Go
    "gin":                 "Gin (Go)",
    "echo":                "Echo (Go)",
    "fiber":               "Fiber (Go)",

    # Rust
    "actix-web":           "Actix-web",
    "axum":                "Axum",

    # .NET
    "aspnetcore":          "ASP.NET Core",
    "microsoft.aspnetcore":"ASP.NET Core",
}

DATABASE_SIGNALS = {
    # MongoDB
    "mongoose":            "MongoDB",
    "mongodb":             "MongoDB",
    "pymongo":             "MongoDB",
    "motor":               "MongoDB",  # async MongoDB driver for Python

    # PostgreSQL
    "pg":                  "PostgreSQL",
    "postgres":            "PostgreSQL",
    "psycopg2":            "PostgreSQL",
    "psycopg":             "PostgreSQL",
    "asyncpg":             "PostgreSQL",

    # MySQL
    "mysql":               "MySQL",
    "mysql2":              "MySQL",
    "mysql-connector":     "MySQL",
    "pymysql":             "MySQL",

    # Others
    "mariadb":             "MariaDB",
    "sqlite3":             "SQLite",
    "better-sqlite3":      "SQLite",
    "aiosqlite":           "SQLite",

    # ORMs
    "sequelize":           "SQL (Sequelize ORM)",
    "typeorm":             "SQL (TypeORM)",
    "prisma":              "SQL (Prisma ORM)",
    "drizzle-orm":         "SQL (Drizzle ORM)",
    "sqlalchemy":          "SQL (SQLAlchemy)",
    "alembic":             "SQL (SQLAlchemy/Alembic)",
    "tortoise-orm":        "SQL (Tortoise ORM)",

    # Cache / KV
    "redis":               "Redis",
    "ioredis":             "Redis",
    "aioredis":            "Redis",
    "memcached":           "Memcached",
    "pymemcache":          "Memcached",

    # Search
    "elasticsearch":       "Elasticsearch",
    "elastic":             "Elasticsearch",

    # Graph
    "neo4j":               "Neo4j",

    # Cloud
    "dynamodb":            "DynamoDB",
    "firestore":           "Firestore",
    "cosmosdb":            "Cosmos DB",
    "@azure/cosmos":       "Cosmos DB",
    "supabase":            "Supabase (PostgreSQL)",

    # Java JDBC / Spring
    "postgresql":          "PostgreSQL",
    "h2":                  "H2",
    "hibernate":           "SQL (Hibernate ORM)",
    "spring-data-jpa":     "SQL (Spring Data JPA)",
    "spring-data-mongodb": "MongoDB",
    "spring-data-redis":   "Redis",
}

# Docker image names that hint at a database being used
DOCKER_DB_SIGNALS = {
    "postgres":     "PostgreSQL",
    "mysql":        "MySQL",
    "mariadb":      "MariaDB",
    "mongo":        "MongoDB",
    "mongodb":      "MongoDB",
    "redis":        "Redis",
    "elasticsearch":"Elasticsearch",
    "neo4j":        "Neo4j",
    "cassandra":    "Cassandra",
    "influxdb":     "InfluxDB",
    "rabbitmq":     "RabbitMQ",
    "kafka":        "Kafka",
    "zookeeper":    "Zookeeper",
    "sqlite":       "SQLite",
    "cockroachdb":  "CockroachDB",
    "couchdb":      "CouchDB",
}


def detect_stack(folder: Path, components: list[dict]) -> dict:
    """Detect frontend, backend, and database by scanning package names and config files."""
    package_names = [comp["name"].lower() for comp in components]

    frontend = _detect_from_packages(package_names, FRONTEND_SIGNALS)
    backend  = _detect_from_packages(package_names, BACKEND_SIGNALS)
    database = _detect_from_packages(package_names, DATABASE_SIGNALS)

    # Fall back to file-based detection if package scan didn't find anything
    if database == "Unknown":
        database = _detect_db_from_files(folder)
    if frontend == "Unknown":
        frontend = _detect_frontend_from_files(folder)
    if backend == "Unknown":
        backend = _detect_backend_from_files(folder)

    # Also check Docker image names (e.g. postgres:15 in docker-compose.yml)
    docker_db = _detect_db_from_docker_components(components)
    if docker_db and database == "Unknown":
        database = docker_db

    return {
        "frontend": frontend,
        "backend":  backend,
        "database": database,
    }


def _detect_from_packages(package_names: list[str], signals: dict) -> str:
    """Return the first matching label from signals, or 'Unknown'."""
    for keyword, label in signals.items():
        kw_lower = keyword.lower()
        for pkg in package_names:
            if pkg == kw_lower or pkg.startswith(kw_lower):
                return label
    return "Unknown"


def _detect_db_from_docker_components(components: list[dict]) -> str:
    """Check Docker image names from the parsed component list for DB signals."""
    for comp in components:
        if comp.get("ecosystem") != "docker":
            continue
        image_name = comp["name"].lower()
        for keyword, label in DOCKER_DB_SIGNALS.items():
            if keyword in image_name:
                return label
    return ""


def _detect_frontend_from_files(folder: Path) -> str:
    """Fallback: check for framework-specific config files like next.config.js."""
    config_signals = {
        "next.config.js":    "Next.js",
        "next.config.ts":    "Next.js",
        "next.config.mjs":   "Next.js",
        ".angular-cli.json": "Angular",
        "vite.config.js":    "Vite",
        "vite.config.ts":    "Vite",
        "nuxt.config.js":    "Nuxt.js",
        "nuxt.config.ts":    "Nuxt.js",
        "svelte.config.js":  "SvelteKit",
        "gatsby-config.js":  "Gatsby",
        "remix.config.js":   "Remix",
        "astro.config.mjs":  "Astro",
    }
    for filename, label in config_signals.items():
        if (folder / filename).exists():
            return label

    if (folder / "angular.json").exists():
        return "Angular"

    return "Unknown"


def _detect_backend_from_files(folder: Path) -> str:
    """Fallback: check for files that hint at a backend framework."""
    if (folder / "manage.py").exists():
        try:
            content = (folder / "manage.py").read_text(encoding="utf-8")
            if "django" in content.lower():
                return "Django"
        except OSError:
            pass

    if (folder / "pom.xml").exists():
        try:
            content = (folder / "pom.xml").read_text(encoding="utf-8").lower()
            if "spring-boot" in content:
                return "Spring Boot"
        except OSError:
            pass

    if (folder / "Dockerfile").exists():
        try:
            content = (folder / "Dockerfile").read_text(encoding="utf-8").lower()
            for line in content.splitlines():
                if line.startswith("from"):
                    if "python" in line:
                        return "Python (framework unknown)"
                    if "node" in line:
                        return "Node.js (framework unknown)"
                    if "java" in line or "openjdk" in line:
                        return "Java (framework unknown)"
        except OSError:
            pass

    return "Unknown"


def _detect_db_from_files(folder: Path) -> str:
    """Fallback: look for DB connection strings in .env and config files."""
    env_signals = {
        "MONGODB_URI":   "MongoDB",
        "MONGO_URI":     "MongoDB",
        "MONGO_URL":     "MongoDB",
        "POSTGRES":      "PostgreSQL",
        "PG_":           "PostgreSQL",
        "MYSQL":         "MySQL",
        "REDIS_URL":     "Redis",
        "REDIS_HOST":    "Redis",
        "SQLITE":        "SQLite",
    }

    files_to_check = [
        folder / ".env",
        folder / ".env.example",
        folder / ".env.sample",
        folder / "application.yml",
        folder / "application.yaml",
        folder / "application.properties",
        folder / "config" / "database.yml",
        folder / "config.yml",
    ]

    for f in files_to_check:
        if not f.exists():
            continue
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        content_lower = content.lower()

        # Check for full connection string patterns first
        if "mongodb://" in content_lower or "mongodb+srv://" in content_lower:
            return "MongoDB"
        if "postgresql://" in content_lower or "postgres://" in content_lower:
            return "PostgreSQL"
        if "mysql://" in content_lower:
            return "MySQL"
        if "redis://" in content_lower or "rediss://" in content_lower:
            return "Redis"
        if "sqlite" in content_lower:
            return "SQLite"

        for line in content.splitlines():
            line_upper = line.upper()
            for signal, db_label in env_signals.items():
                if signal.upper() in line_upper and db_label:
                    return db_label

    return "Unknown"
