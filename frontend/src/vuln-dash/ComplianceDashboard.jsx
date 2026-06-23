import { useEffect, useState } from 'react';
import { fetchCompliance } from '../api/api.js';

function formatTimestamp(value) {
  if (!value) return 'Not present';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function supplierName(component) {
  if (typeof component.supplier === 'string') return component.supplier || 'Missing';
  return component.supplier?.name || 'Missing';
}

export default function ComplianceDashboard({ sbomId, components: initialComponents = [] }) {
  const [meta, setMeta] = useState(null);
  const [checks, setChecks] = useState([]);
  const [components, setComponents] = useState(initialComponents);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sbomId) return;
    setError(null);
    fetchCompliance(sbomId)
      .then((data) => {
        setMeta(data.projectMeta);
        setChecks(data.checks ?? []);
        setComponents(data.components ?? []);
      })
      .catch((err) => setError(err.message));
  }, [sbomId]);

  if (error) {
    return <div className="tab-loading" style={{ color: 'var(--critical)' }}>Error: {error}</div>;
  }

  if (!meta) {
    return <div className="tab-loading">Loading compliance data...</div>;
  }

  const verifiedComponents = components.filter((item) => item.status === 'pass').length;
  const reviewComponents = components.length - verifiedComponents;
  const compliancePercent = meta.compliancePercentage ?? 0;
  const scoreColor = compliancePercent >= 80 ? 'var(--low)' : 'var(--critical)';
  const totalElements = meta.totalChecks ?? checks.length;
  const passedElements = meta.passedChecks ?? checks.filter((check) => check.passed).length;

  return (
    <div className="compliance-panel">
      <div className="compliance-stats-row">
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Compliance Score</p>
          <p className="stat-value" style={{ color: scoreColor, fontSize: '2rem' }}>
            {compliancePercent}%
          </p>
          <span className="stat-sub">NTIA minimum elements plus machine-readable format</span>
        </div>

        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Components</p>
          <p className="stat-value">{components.length}</p>
          <span className="stat-sub">{verifiedComponents} verified, {reviewComponents} need review</span>
        </div>

        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Dependency Links</p>
          <p className="stat-value">{meta.totalDependencies ?? 0}</p>
          <span className="stat-sub">CycloneDX dependsOn relationships</span>
        </div>

        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Checklist</p>
          <p className="stat-value">
            <span style={{ color: 'var(--low)' }}>{passedElements}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1.2rem' }}> / </span>
            <span>{totalElements}</span>
          </p>
          <span className="stat-sub">Passing requirements in this SBOM</span>
        </div>
      </div>

      <div className="compliance-meta-bar cardvuln">
        <span className="stat-label">Authors</span>
        <strong>{meta.author || 'Not declared'}</strong>
        <span className="stat-label" style={{ marginLeft: '2em' }}>Timestamp</span>
        <strong>{formatTimestamp(meta.timestamp)}</strong>
      </div>

      <div className="cardvuln compliance-scorecard">
        <div className="compliance-scorecard-header">
          <div>
            <p className="stat-label">NTIA Scorecard</p>
            <p className="stat-value" style={{ color: 'var(--teal)', fontSize: '1.75rem', margin: 0 }}>
              {passedElements} / {totalElements} checks passing
            </p>
          </div>
        </div>

        <div className="ntia-check-grid">
          {checks.map((check) => (
            <div key={check.id ?? check.label} className="ntia-check-row">
              <div>
                <div className="ntia-check-title">{check.label}</div>
                <div className="ntia-check-meta">
                  {check.field} | NTIA {check.ntiaElement} | {check.passCondition}
                </div>
              </div>
              <span className={check.passed ? 'status-badge-new' : 'status-badge-unfixed'}>
                {check.passed ? 'Pass' : 'Fail'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="cardvuln compliance-table-card">
        <div className="header-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Component Compliance Summary</h2>
          <span className="stat-label">Supplier, version and PURL audit</span>
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
              {components.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                    No components found for this SBOM.
                  </td>
                </tr>
              )}
              {components.map((component, index) => {
                const isPass = component.status === 'pass';
                return (
                  <tr key={component.purl || component.name || index} className="compliance-row">
                    <td>{supplierName(component)}</td>
                    <td style={{ color: 'var(--teal)', fontFamily: 'Anta' }}>{component.name || 'Missing'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.6)' }}>{component.version || 'Missing'}</td>
                    <td className="mono-cell">{component.purl || 'Missing'}</td>
                    <td>{component.license || 'Unknown'}</td>
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
