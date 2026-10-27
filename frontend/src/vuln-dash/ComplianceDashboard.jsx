import { useEffect, useState } from 'react';
import { fetchCompliance } from '../api/api.js';
import DataTableCard from '../components/DataTableCard.jsx';

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
        <div className="cardvuln app-surface compliance-stat-card">
          <p className="stat-label">Compliance Score</p>
          <p className="stat-value compliance-score-value" style={{ color: scoreColor }}>
            {compliancePercent}%
          </p>
          <span className="stat-sub">NTIA minimum elements plus machine-readable format</span>
        </div>

        <div className="cardvuln app-surface compliance-stat-card">
          <p className="stat-label">Components</p>
          <p className="stat-value">{components.length}</p>
          <span className="stat-sub">{verifiedComponents} verified, {reviewComponents} need review</span>
        </div>

        <div className="cardvuln app-surface compliance-stat-card">
          <p className="stat-label">Dependency Links</p>
          <p className="stat-value">{meta.totalDependencies ?? 0}</p>
          <span className="stat-sub">CycloneDX dependsOn relationships</span>
        </div>

        <div className="cardvuln app-surface compliance-stat-card">
          <p className="stat-label">Checklist</p>
          <p className="stat-value">
            <span style={{ color: 'var(--low)' }}>{passedElements}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1.2rem' }}> / </span>
            <span>{totalElements}</span>
          </p>
          <span className="stat-sub">Passing requirements in this SBOM</span>
        </div>
      </div>

      <div className="compliance-meta-bar cardvuln app-surface">
        <div className="compliance-meta-item">
          <span className="stat-label">Authors</span>
          <strong>{meta.author || 'Not declared'}</strong>
        </div>
        <div className="compliance-meta-item">
          <span className="stat-label">Timestamp</span>
          <strong>{formatTimestamp(meta.timestamp)}</strong>
        </div>
      </div>

      <div className="cardvuln app-surface compliance-scorecard">
        <div className="compliance-scorecard-header">
          <div>
            <p className="stat-label">NTIA Scorecard</p>
            <p className="stat-value compliance-check-count">
              {passedElements} / {totalElements} checks passing
            </p>
          </div>
        </div>

        <div className="ntia-check-grid">
          {checks.map((check) => (
            <div
              key={check.id ?? check.label}
              className={`ntia-check-row ${check.passed ? 'is-passed' : 'is-failed'}`}
            >
              <div className="ntia-check-content">
                <div className="ntia-check-heading">
                  <div className="ntia-check-title">{check.label}</div>
                  <span className={`compliance-check-pill ${check.passed ? 'is-passed' : 'is-failed'}`}>
                    {check.passed ? 'Pass' : 'Fail'}
                  </span>
                </div>
                <div className="ntia-check-meta">
                  <span><strong>Field</strong>{check.field || 'Not specified'}</span>
                  <span><strong>NTIA</strong>{check.ntiaElement || 'Not specified'}</span>
                  <span><strong>Pass condition</strong>{check.passCondition || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTableCard
        title="Component Compliance Summary"
        meta={<span className="compliance-table-meta">Supplier, version and PURL audit</span>}
        className="cardvuln app-surface compliance-table-card"
        headerClassName="compliance-table-header"
        titleClassName="compliance-table-title"
        scrollClassName="compliance-table-scroll"
      >
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
                <tr className="app-data-table-empty">
                  <td colSpan={6}>
                    No components found for this SBOM.
                  </td>
                </tr>
              )}
              {components.map((component, index) => {
                const isPass = component.status === 'pass';
                return (
                  <tr key={component.purl || component.name || index} className="compliance-row">
                    <td>{supplierName(component)}</td>
                    <td className="compliance-component-name">{component.name || 'Missing'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.6)' }}>{component.version || 'Missing'}</td>
                    <td className="mono-cell">{component.purl || 'Missing'}</td>
                    <td>{component.license || 'Unknown'}</td>
                    <td>
                      <span className={`compliance-status-pill ${isPass ? 'is-verified' : 'is-review'}`}>
                        {isPass ? 'Verified' : 'Review'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
      </DataTableCard>
    </div>
  );
}
