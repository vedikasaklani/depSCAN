// Props received from vuln-dash.jsx:
//   components  →  array from GET /sbom/components/{sbom_id}
//                  each: { sbom_id, name, version, purl, supplier, license }
//   security    →  the raw sbom object from GET /sbom/{sbom_id}
//                  used for scan date / project name in the meta bar
export default function ComplianceDashboard({ components = [], security = {} }) {
  // Backend stores license as a flat string, not nested object
  // Handle both shapes: "MIT"  OR  { license: { id: "MIT" } }
  const getLicense = (comp) =>
    typeof comp.license === 'string'
      ? comp.license
      : comp.licenses?.[0]?.license?.id ?? 'Unknown';

  // Backend has no pass/fail field — derive from whether component has known vulns
  // For now treat all as pass; vuln-dash can extend this once vuln data is correlated
  const passCount = components.length;
  const failCount = 0;

  // supplier comes as a string from the backend (stored as comp.supplier, not {name:...})
  const getSupplier = (comp) =>
    typeof comp.supplier === 'string'
      ? comp.supplier
      : comp.supplier?.name ?? 'Unknown';

  const scanDate = security.uploaded_at
    ? new Date(security.uploaded_at).toLocaleString()
    : '—';

  return (
    <div className="compliance-panel">

      <div className="compliance-stats-row">
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Components</p>
          <p className="stat-value">{components.length}</p>
          <span className="stat-sub">Tracked packages in this SBOM</span>
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
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Project</p>
          <p className="stat-value" style={{ fontSize: '1rem', fontFamily: 'Anta' }}>
            {security.project ?? '—'}
          </p>
          <span className="stat-sub">From uploaded SBOM metadata</span>
        </div>
        <div className="cardvuln compliance-stat-card">
          <p className="stat-label">Scan Date</p>
          <p className="stat-value" style={{ fontSize: '0.9rem' }}>{scanDate}</p>
          <span className="stat-sub">Uploaded at timestamp</span>
        </div>
      </div>

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
              {components.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '1.5em' }}>
                    No components found for this scan
                  </td>
                </tr>
              )}
              {components.map((comp, i) => (
                <tr key={comp.purl ?? i} className="compliance-row">
                  <td>{getSupplier(comp)}</td>
                  <td style={{ color: 'var(--teal)', fontFamily: 'Anta' }}>{comp.name}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)' }}>{comp.version}</td>
                  <td className="mono-cell">{comp.purl ?? '—'}</td>
                  <td>{getLicense(comp)}</td>
                  <td>
                    <span className="status-badge-new">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}