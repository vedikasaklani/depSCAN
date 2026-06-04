import './ExportReport.css';

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default function ExportReport({ report }) {
  if (!report) {
    return <div className="export-report-shell">Loading export panel...</div>;
  }

  // JSON export payloads — use the array fields, never rendered directly in JSX
  const cyclonePayload = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    metadata: {
      timestamp: report.scanDate,
      component: { name: report.projectName },
    },
    components: report.componentsPayload,
    dependencies: report.dependenciesPayload,
    vulnerabilities: report.vulnerabilitiesPayload,
  };

  const spdxPayload = {
    SPDXID: 'SPDXRef-DOCUMENT',
    name: report.projectName,
    documentNamespace: `http://spdx.org/spdxdocs/${report.projectName}-${report.scanDate}`,
    creationInfo: {
      created: report.timestamp,
      creators: [],
    },
    packages: report.componentsPayload,
    relationships: report.dependenciesPayload,
  };

  const exportPdf = () => {
    const content = `Compliance Report

Project: ${report.projectName}
Scan date: ${report.scanDate}

Compliance Score: ${report.complianceScore}%
Total Components: ${report.componentCount}
Total Dependencies: ${report.dependencyCount}
Total Vulnerabilities: ${report.vulnerabilityCount}

Summary:
${report.summary}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    downloadBlob(blob, `${report.projectName.replace(/\s+/g, '-')}-compliance-report.pdf`);
  };

  return (
    <div className="export-report-shell">
      <div className="export-header">
        <div>
          <p>Export &amp; Reporting</p>
          <h2>Compliance Report Preview</h2>
          <p>Download SBOM exports or generate a compliance report for audit sharing and stakeholder review.</p>
        </div>
      </div>

      <div className="export-actions">
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              new Blob([JSON.stringify(cyclonePayload, null, 2)], { type: 'application/json' }),
              `${report.projectName.replace(/\s+/g, '-')}-cyclonedx.json`
            )
          }
        >
          Download CycloneDX JSON
        </button>
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              new Blob([JSON.stringify(spdxPayload, null, 2)], { type: 'application/json' }),
              `${report.projectName.replace(/\s+/g, '-')}-spdx.json`
            )
          }
        >
          Download SPDX JSON
        </button>
        <button type="button" onClick={exportPdf}>
          Download PDF Compliance Report
        </button>
      </div>

      <div className="preview-card">
        <div className="preview-row">
          <div>
            <span>Project</span>
            <strong>{report.projectName}</strong>
          </div>
          <div>
            <span>Scan Date</span>
            <strong>{report.scanDate}</strong>
          </div>
        </div>
        <div className="preview-row">
          <div>
            <span>Components</span>
            <strong>{report.componentCount}</strong>
          </div>
          <div>
            <span>Dependencies</span>
            <strong>{report.dependencyCount}</strong>
          </div>
        </div>
        <div className="preview-row">
          <div>
            <span>Vulnerabilities</span>
            <strong>{report.vulnerabilityCount}</strong>
          </div>
          <div>
            <span>Compliance</span>
            <strong>{report.complianceScore}%</strong>
          </div>
        </div>
        <div className="preview-summary">
          <p>{report.summary}</p>
        </div>
      </div>
    </div>
  );
}