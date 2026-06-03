import { useEffect, useState } from 'react';
import { fetchComplianceData } from './api';
import './ComplianceDashboard.css';

const statusClasses = {
  pass: 'status-pass',
  fail: 'status-fail',
};

const complianceIndicators = {
  pass: 'Verified',
  fail: 'Review',
};

export default function ComplianceDashboard() {
  const [meta, setMeta] = useState(null);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    fetchComplianceData().then((data) => {
      setMeta(data.projectMeta);
      setComponents(data.components);
    });
  }, []);

  if (!meta) {
    return <div className="compliance-dashboard-shell">Loading compliance dashboard...</div>;
  }

  const passCount = components.filter((item) => item.status === 'pass').length;
  const failCount = components.length - passCount;
  const compliancePercent = meta.compliancePercentage;
  const complianceClass = compliancePercent >= 80 ? 'dashboard-score-good' : 'dashboard-score-warning';

  return (
    <div className="compliance-dashboard-shell">
      <section className="dashboard-topbar">
        <div>
          <p className="dashboard-label">NTIA Compliance Dashboard</p>
          <h1>SBOM Audit &amp; Compliance</h1>
          <p className="dashboard-subtitle">Supplier awareness, component health, and dependency traceability across your software bill of materials.</p>
        </div>
        <div className="dashboard-meta-card">
          <span>Author</span>
          <strong>{meta.author}</strong>
          <span>Scan Date</span>
          <strong>{new Date(meta.timestamp).toLocaleString()}</strong>
        </div>
      </section>

      <section className="dashboard-cards-row">
        <article className="dashboard-card dashboard-score-card">
          <p>Compliance Score</p>
          <div className={complianceClass}>{compliancePercent}%</div>
          <span>Live score based on licensing, supplier metadata, and dependency visibility.</span>
        </article>
        <article className="dashboard-card">
          <p>Components</p>
          <strong>{components.length}</strong>
          <span>Tracked packages within the current SBOM.</span>
        </article>
        <article className="dashboard-card">
          <p>Dependency Relationships</p>
          <strong>{meta.totalDependencies}</strong>
          <span>Parent-child links discovered in the dependency tree.</span>
        </article>
        <article className="dashboard-card">
          <p>Pass / Fail</p>
          <strong>{passCount} / {failCount}</strong>
          <span>Packages meeting compliance criteria versus review candidates.</span>
        </article>
      </section>

      <section className="dashboard-table-panel">
        <div className="table-panel-header">
          <h2>Component Compliance Summary</h2>
          <p>Review supplier, version, PURL, and dependency relationships for each tracked component.</p>
        </div>
        <div className="dashboard-table-wrapper">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Component</th>
                <th>Version</th>
                <th>PURL</th>
                <th>License</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => {
                const licenseId = component.licenses?.[0]?.license?.id || 'Unknown';
                return (
                  <tr key={component.name}>
                    <td>{component.supplier.name}</td>
                    <td>{component.name}</td>
                    <td>{component.version}</td>
                    <td className="mono-text">{component.purl}</td>
                    <td>{licenseId}</td>
                    <td>
                      <span className={`status-pill ${statusClasses[component.status]}`}>
                        {complianceIndicators[component.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
