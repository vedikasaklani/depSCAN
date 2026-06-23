const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API ${path} → ${res.status}`);
  }

  return res.json();
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function packageNameFromRef(ref) {
  if (!ref) return undefined;

  const cleanRef = ref.split("?")[0].split("#")[0].replace(/@[^/@]*$/, "");
  return cleanRef.replace(/\/$/, "").split("/").pop();
}

function normalizeComponent(component, sbomId) {
  const supplierName =
    typeof component?.supplier === "string"
      ? component.supplier
      : component?.supplier?.name;

  const licenseId =
    component?.license ??
    component?.licenses?.[0]?.license?.id;

  return {
    ...component,
    sbom_id: component?.sbom_id ?? sbomId,
    supplier: { name: supplierName || "NOASSERTION" },
    license: licenseId,
    licenses:
      component?.licenses ??
      (licenseId ? [{ license: { id: licenseId } }] : []),
  };
}

function normalizeDependencyEdges(dependencies = [], sbomId) {
  return dependencies.flatMap((dependency) => {
    const parent = dependency?.ref;
    const children = dependency?.dependsOn ?? [];

    return children.map((child) => ({
      sbom_id: sbomId,
      parent,
      child,
    }));
  });
}

function normalizeVuln(vuln, sbomId) {
  const affectedRef = vuln?.affects?.[0]?.ref;
  const severity = vuln?.severity ?? vuln?.ratings?.[0]?.severity ?? "UNKNOWN";

  return {
    ...vuln,
    sbom_id: vuln?.sbom_id ?? sbomId,
    cve_id: vuln?.cve_id ?? vuln?.cve ?? vuln?.id,
    severity,
    summary: vuln?.summary ?? vuln?.description ?? vuln?.detail,
    component_name:
      vuln?.component_name ??
      vuln?.component ??
      vuln?.package ??
      packageNameFromRef(affectedRef),
    purl: vuln?.purl ?? affectedRef,
  };
}

async function fetchCollectionWithSbomFallback(sbomId, collectionPath, getEmbedded) {
  try {
    const collectionData = await apiFetch(collectionPath);
    if (hasItems(collectionData)) return collectionData;
  } catch {
  }

  const sbom = await fetchSbom(sbomId);
  return getEmbedded(sbom);
}

function countBySeverity(vulns, severity) {
  return vulns.filter(
    (vuln) => (vuln.severity ?? "").toUpperCase() === severity
  ).length;
}

export async function fetchAllScans() {
  return apiFetch("/sbom/all");
}

export async function fetchSbom(sbomId) {
  return apiFetch(`/sbom/${sbomId}`);
}

export async function fetchSummary(sbomId) {
  const [sbom, components, vulns] = await Promise.all([
    fetchSbom(sbomId),
    fetchComponents(sbomId),
    fetchVulns(sbomId),
  ]);

  return {
    projectName: sbom.project ?? sbom.metadata?.component?.name,
    scanDate: sbom.uploaded_at ?? sbom.metadata?.timestamp,
    components: components.length,
    vulnerabilities: vulns.length,
    critical: countBySeverity(vulns, "CRITICAL"),
    high: countBySeverity(vulns, "HIGH"),
    medium: countBySeverity(vulns, "MEDIUM"),
    low: countBySeverity(vulns, "LOW"),
    timestamp: sbom.uploaded_at ?? sbom.metadata?.timestamp,
  };
}

export async function fetchComponents(sbomId) {
  return fetchCollectionWithSbomFallback(
    sbomId,
    `/sbom/components/${sbomId}`,
    (sbom) => (sbom.components ?? []).map((component) =>
      normalizeComponent(component, sbomId)
    )
  );
}

export async function fetchDependencies(sbomId) {
  return fetchCollectionWithSbomFallback(
    sbomId,
    `/sbom/dependencies/${sbomId}`,
    (sbom) => normalizeDependencyEdges(sbom.dependencies ?? [], sbomId)
  );
}

export async function fetchVulns(sbomId) {
  return fetchCollectionWithSbomFallback(
    sbomId,
    `/sbom/vulns/${sbomId}`,
    (sbom) => (sbom.vulnerabilities ?? sbom.vulns ?? []).map((vuln) =>
      normalizeVuln(vuln, sbomId)
    )
  );
}

export async function fetchCompliance(sbomId) {
  return apiFetch(`/sbom/compliance/${sbomId}`);
}

export async function fetchProjectHistory(projectName) {
  return apiFetch(
    `/sbom/project/${encodeURIComponent(projectName)}/history`
  );
}

export async function fetchProjects() {
  return apiFetch("/sbom/projects");
}

export async function fetchPackage(packageName) {
  return apiFetch(
    `/sbom/package/${encodeURIComponent(packageName)}`
  );
}

export async function diffScans(oldId, newId) {
  return apiFetch(`/sbom/diff/${oldId}/${newId}`);
}

export async function uploadSBOM(sbomJson) {
  return apiFetch("/sbom/upload", {
    method: "POST",
    body: JSON.stringify(sbomJson),
  });
}

export async function startScan(projectName, repoUrl) {
  return apiFetch("/scan/", {
    method: "POST",
    body: JSON.stringify({
      project_name: projectName,
      repo_url: repoUrl,
    }),
  });
}


export async function addVuln(sbomId, vulnData) {
  if (!sbomId) {
    throw new Error("addVuln requires an sbomId");
  }

  return apiFetch(`/sbom/vulns/${sbomId}`, {
    method: "POST",
    body: JSON.stringify(vulnData),
  });
}