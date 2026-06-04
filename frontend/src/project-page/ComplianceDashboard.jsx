import { useEffect, useState } from 'react';
import { fetchComplianceData } from './api';
// No own CSS import — styles live in vuln-dash.css

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
    return <div className="tab-loading">Loading compliance data...</div>;
  }

  const passCount = components.filter((item) => item.status === 'pass').length;
  const failCount = components.length - passCount;
  const compliancePercent = meta.compliancePercentage;
  const scoreColor = compliancePercent >= 80 ? 'var(--low)' : 'var(--critical)';

  return (
    <div className="compliance-panel">

      {/* Stats row */}
      <div className="compliance-stats-row">
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Compliance Score</p>
          <p className="stat-value" style={{ color: scoreColor, fontSize: '2rem' }}>
            {compliancePercent}%
          </p>
          <span className="stat-sub">Based on licensing, supplier metadata &amp; dependency visibility</span>
        </div>
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Components</p>
          <p className="stat-value">{components.length}</p>
          <span className="stat-sub">Tracked packages in this SBOM</span>
        </div>
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Dependency Links</p>
          <p className="stat-value">{meta.totalDependencies}</p>
          <span className="stat-sub">Parent-child relationships discovered</span>
        </div>
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Pass / Fail</p>
          <p className="stat-value">
            <span style={{ color: 'var(--low)' }}>{passCount}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1.2rem' }}> / </span>
            <span style={{ color: 'var(--critical)' }}>{failCount}</span>
          </p>
          <span className="stat-sub">Compliance criteria vs review candidates</span>
        </div>
      </div>

      {/* Author bar */}
      <div className="compliance-meta-bar cardvuln">
        <span className="stat-label">Author</span>
        <strong>{meta.author}</strong>
        <span className="stat-label" style={{ marginLeft: '2em' }}>Scan Date</span>
        <strong>{new Date(meta.timestamp).toLocaleString()}</strong>
      </div>

      {/* Table */}
      <div className="cardvuln compliance-table-card">
        <div className="header-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Component Compliance Summary</h2>
          <span className="stat-label">NTIA SBOM Audit</span>
        </div>
        <div className="compliance-table-scroll">
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
                const isPass = component.status === 'pass';
                return (
                  <tr key={component.name} className="compliance-row">
                    <td>{component.supplier.name}</td>
                    <td style={{ color: 'var(--teal)', fontFamily: 'Anta' }}>{component.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.6)' }}>{component.version}</td>
                    <td className="mono-cell">{component.purl}</td>
                    <td>{licenseId}</td>
                    <td>
                      <span className={isPass ? 'status-badge-new' : 'status-badge-unfixed'}>
                        {isPass ? 'Verified' : 'Review'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}