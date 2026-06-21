# SBOM Vulnerability Enrichment

A MongoDB-backed SBOM enrichment tool that fetches vulnerabilities from OSV and NVD.

## Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and set your values:
   ```bash
   copy .env.example .env
   ```

## Environment variables

- `MONGO_URI` — MongoDB connection string
- `NVD_API_KEY` — NVD API key for CVE enrichment

## Run

- Enrich components from MongoDB:
  ```bash
  python run_enrichment.py
  ```
- Check stored vulnerability summary:
  ```bash
  python check_vulns.py
  ```
