const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchAllScans() {
  return apiFetch('/sbom/all');
}
export async function fetchSbom(sbomId) {
  return apiFetch(`/sbom/${sbomId}`);
}

export async function fetchComponents(sbomId) {
  return apiFetch(`/sbom/components/${sbomId}`);
}

export async function fetchVulns(sbomId) {
  return apiFetch(`/sbom/vulns/${sbomId}`);
}

export async function fetchProjectHistory(projectName) {
  return apiFetch(`/sbom/project/${encodeURIComponent(projectName)}/history`);
}

export async function diffScans(oldId, newId) {
  return apiFetch(`/sbom/diff/${oldId}/${newId}`);
}
export async function uploadSBOM(sbomJson) {
  return apiFetch('/sbom/upload', {
    method: 'POST',
    body: JSON.stringify(sbomJson),
  });
}
export async function addVuln(vulnData) {
  return apiFetch('/sbom/vulns/add', {
    method: 'POST',
    body: JSON.stringify(vulnData),
  });
}