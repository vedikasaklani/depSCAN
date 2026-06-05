import "./vuln-dash.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllScans, fetchComponents, fetchVulns } from "../api/api.js";
import Vulnsection         from "./vuln-section";
import SummaryCard         from "./summarycard";
import ComplianceDashboard from "../project-page/ComplianceDashboard";
import DependencyGraph     from "../project-page/DependencyGraph";

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

const TABS = [
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "compliance",      label: "Compliance"      },
  { id: "dependencies",    label: "Dependencies"    },
]
function groupVulnsBySeverity(vulnList = []) {
  const groups = { critical: [], high: [], medium: [], low: [] };
  for (const v of vulnList) {
    const key = (v.severity ?? '').toLowerCase();
    if (key in groups) groups[key].push(v);
    else groups.low.push(v);          // unknown severity → low bucket
  }
  return groups;
}

function VulnerabilityDashboard() {
  const { id }   = useParams();         
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [sbom,       setSbom]       = useState(null);
  const [components, setComponents] = useState([]);
  const [vulns,      setVulns]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAllScans(id),
      fetchComponents(id),
      fetchVulns(id),
    ])
      .then(([sbomData, compData, vulnData]) => {
        setSbom(sbomData);
        setComponents(compData);
        setVulns(vulnData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="tab-loading">Loading scan data...</div>;
  if (error)   return <div className="tab-loading" style={{ color: 'var(--critical)' }}>Error: {error}</div>;
  if (!sbom)   return <div className="tab-loading">Scan not found.</div>;

  const projectName = sbom.project ?? sbom.sbom_id ?? id;
  const scanDate    = sbom.uploaded_at
    ? new Date(sbom.uploaded_at).toLocaleString()
    : '—';
  const safeName    = projectName.replace(/\s+/g, '-');
  const groupedVulns = groupVulnsBySeverity(vulns);
  const downloadCycloneDX = () => {
    const payload = {
      bomFormat:   'CycloneDX',
      specVersion: '1.4',
      metadata: {
        timestamp: sbom.uploaded_at,
        component: { name: projectName },
      },
      components,
      vulnerabilities: vulns,
    };
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      `${safeName}-cyclonedx.json`
    );
  };

  const downloadSPDX = () => {
    const payload = {
      SPDXID:            'SPDXRef-DOCUMENT',
      name:              projectName,
      documentNamespace: `http://spdx.org/spdxdocs/${safeName}-${sbom.uploaded_at}`,
      creationInfo:      { created: sbom.uploaded_at, creators: [] },
      packages:          components,
    };
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      `${safeName}-spdx.json`
    );
  };

  return (
    <div className="vuln-dashboard">
      <div className="icon" onClick={() => navigate("/projects")}>
        <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="var(--textlight)">
          <path d="M156-114v-487l324-242.77L804-601v487H566.15v-293.69h-172.3V-114H156Z"/>
        </svg>
      </div>

      <header className="dashboard-header">
        <div>
          <h1>Vulnerability Dashboard</h1>
          <div className="header-meta">
            <span>Project: <span>{projectName}</span></span>
            <span>Scanned on: <span>{scanDate}</span></span>
          </div>
        </div>

        <div className="security-card">
          <button className="download-btn" onClick={() => setActiveTab("compliance")}>
            <svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)">
              <path d="M612.58-367.51q54.5-54.59 54.5-132.58 0-77.99-54.59-132.49-54.59-54.5-132.58-54.5-77.99 0-132.49 54.59-54.5 54.59-54.5 132.58 0 77.99 54.59 132.49 54.59 54.5 132.58 54.5 77.99 0 132.49-54.59ZM402-422.12q-32-32.12-32-78T402.12-578q32.12-32 78-32T558-577.88q32 32.12 32 78T557.88-422q-32.12 32-78 32T402-422.12Zm-197.38 147.5Q81.16-359.23 25.54-500q55.62-140.77 179.02-225.38Q327.97-810 479.95-810q151.97 0 275.43 84.62Q878.84-640.77 934.46-500q-55.62 140.77-179.02 225.38Q632.03-190 480.05-190q-151.97 0-275.43-84.62ZM480-500Zm211.87 163.42Q788.74-397.16 840-500q-51.26-102.84-148.13-163.42Q595-724 480-724t-211.87 60.58Q171.26-602.84 120-500q51.26 102.84 148.13 163.42Q365-276 480-276t211.87-60.58Z"/>
            </svg>
            <p>NTIA Score</p>
          </button>
          <button className="download-btn" onClick={downloadCycloneDX}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)">
              <path d="M479-322.46 268.23-533.23l61.16-60.38L436-487v-325h86v325l106.61-106.61 61.16 60.38L479-322.46ZM246.31-148q-41.03 0-69.67-28.64T148-246.31v-108.46h86v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h467.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h86v108.46q0 41.31-28.64 69.81T713.69-148H246.31Z"/>
            </svg>
            <p>Cyclone.DX</p>
          </button>
          <button className="download-btn" onClick={downloadSPDX}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)">
              <path d="M479-322.46 268.23-533.23l61.16-60.38L436-487v-325h86v325l106.61-106.61 61.16 60.38L479-322.46ZM246.31-148q-41.03 0-69.67-28.64T148-246.31v-108.46h86v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h467.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h86v108.46q0 41.31-28.64 69.81T713.69-148H246.31Z"/>
            </svg>
            <p>SPDX</p>
          </button>
        </div>
      </header>

      <div className="dash-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`dash-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "vulnerabilities" && (
        <>
          <SummaryCard sbomId={id} groupedVulns={groupedVulns} totalComponents={components.length} />
          <Vulnsection groupedVulns={groupedVulns} />
        </>
      )}
      {activeTab === "compliance"   && (
        <ComplianceDashboard components={components} security={sbom} />
      )}
      {activeTab === "dependencies" && (
        <DependencyGraph components={components} vulns={vulns} />
      )}
    </div>
  );
}

export default VulnerabilityDashboard;