# depSCAN
depSCAN is an open-source dependency scanner that generates SBOMs that comply with NTIA guidelines, tracks CVE vulnerabilities across scans, and visualizes risk through severity heatmaps and dependency graphs.

## Features
- SBOM generation in CycloneDX 1.6 format
- NTIA compliance validation
- CVE enrichment via OSV.dev and NVD APIs
- Severity heatmap and dependency graph visualization
- CI/CD integration with GitHub Actions

## Tech Stack
**Frontend:** React, Recharts, D3.js, shadcn/ui

**Backend:** FastAPI, MongoDB

**Standards:** CycloneDX 1.6, SPDX 2.3, NTIA minimum elements.

## Run locally

The local app uses a React/Vite frontend, a FastAPI backend, and MongoDB for scan data. Install Node.js, Python, and MongoDB first, and make sure the MongoDB service is running.

For shared UI colors, surfaces, and component styling conventions, see [the frontend styling reference](frontend/STYLING.md).

### 1. Configure the backend

From the repository root, create a `.env` file with your MongoDB connection string. For a local MongoDB instance, use:

```env
MONGO_URI=mongodb://localhost:27017
```

In PowerShell, create and activate a virtual environment, then install the backend and scanner dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r backend/requirements.txt
py -m pip install -r requirements.txt
```

If PowerShell blocks virtual environment activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal and activate again.

### 2. Start the API

In the activated environment, from the repository root:

```powershell
py -m uvicorn backend.main:app --reload
```

The API runs at `http://localhost:8000`; its interactive API docs are at `http://localhost:8000/docs`.

### 3. Start the frontend

Open a second terminal in the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`) and go to `/projects`.

### 4. Add a scan

Use **New Project** to enter a project name and Git repository URL. The backend clones and scans the repository, creates an SBOM, stores it in MongoDB, and enriches vulnerabilities. The project dashboard will show scan history once a scan completes.

Keep both the API and frontend terminals running while using the app. Starting scans also requires Git and network access to clone the repository and query vulnerability sources.

# Team
- Anwita Padhi
- Akarsh Diwakar
- Pakhi Mittal
- Sneha Chetana
- Ritik Jindal
- Vedika Saklani
