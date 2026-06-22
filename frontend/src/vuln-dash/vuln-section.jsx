import "./vuln-dash.css";
import { useState, useEffect } from "react";

const SEVERITY_VAR = {
    critical: "var(--crit)",
    high: "var(--high)",
    medium: "var(--med)",
    low: "var(--low)"
};

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function VulnModal({ vuln, onClose }) {
    const data = vuln;
    useEffect(() => {
        const onKeyDown = e => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const severityKey = vuln?.severity?.toLowerCase();
    const severityColor = SEVERITY_VAR[severityKey] ?? "var(--teal)";

    return (
        <div className="vuln-modal-backdrop" onClick={onClose}>
            <div
                className="vuln-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Vulnerability detail for ${vuln.cve_id}`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="vuln-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>


                {data && (
                    <>
                        <div className="vuln-modal-header">
                            <h3>{data.cve_id}</h3>
                            <span
                                className="vuln-modal-severity"
                                style={{
                                    borderColor: severityColor,
                                    color: severityColor
                                }}
                            >
                                [ {data.severity?.toUpperCase()} ]
                            </span>
                        </div>

                        <div className="vuln-modal-meta">
                            <div>
                                <span className="vuln-modal-label">Component</span>
                                <span className="vuln-modal-value">
                                    {data.component_name??"-"} {data.component_version??"-"}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">CVSS Score</span>
                                <span className="vuln-modal-value">
                                    {typeof data.cvss_score === "number"
                                        ? data.cvss_score.toFixed(1)
                                        : "—"}
                                </span>
                            </div>

                            <div className="vuln-modal-meta-full">
                                <span className="vuln-modal-label">PURL</span>
                                <span className="vuln-modal-value mono-cell">
                                    {data.purl??"-"}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Published</span>
                                <span className="vuln-modal-value">
                                    {formatDate(data.published??"-")}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Modified</span>
                                <span className="vuln-modal-value">
                                    {formatDate(data.modified??"-")}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Fixed In</span>
                                <span className="vuln-modal-value">
                                    {data.fixed_version || "Not fixed"}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Source</span>
                                <span className="vuln-modal-value">
                                    {data.source}
                                </span>
                            </div>
                        </div>

                        {data.summary && (
                            <p className="vuln-modal-summary">{data.summary??"-"}</p>
                        )}

                        {data.description && (
                            <p className="vuln-modal-description">
                                {data.description??"-"}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Vulnsection({ groupedVulns }) {
    const [selectedVuln, setSelectedVuln] = useState(null);
    const [showUnfixedOnly, setShowUnfixedOnly] = useState(false);
    const [sortField, setSortField] = useState("cvss_score");
    const [sortDirection, setSortDirection] = useState("desc");

    const allVulns = Object.entries(groupedVulns)
        .flatMap(([level, vulns]) =>
            vulns.map((v) => ({
                ...v,
                level,
                fixed: Boolean(v.fixed_version && String(v.fixed_version).trim()),
            }))
        );

    const filteredVulns = allVulns
        .filter((v) => !showUnfixedOnly || !v.fixed)
        .sort((a, b) => {
            const aVal = a[sortField] ?? "";
            const bVal = b[sortField] ?? "";
            if (sortField === "cvss_score") {
                return sortDirection === "desc"
                    ? Number(bVal) - Number(aVal)
                    : Number(aVal) - Number(bVal);
            }
            const aText = String(aVal).toLowerCase();
            const bText = String(bVal).toLowerCase();
            if (aText > bText) return sortDirection === "desc" ? -1 : 1;
            if (aText < bText) return sortDirection === "desc" ? 1 : -1;
            return 0;
        });

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    if (allVulns.length === 0) {
        return (
            <section className="vuln-section cardvuln">
                <div className="section-header">
                    <h2>Vulnerabilities</h2>
                </div>
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>
                    <h3 style={{ margin: 0, color: 'var(--teal)' }}>No vulnerabilities found</h3>
                    <p style={{ margin: '1rem 0 0', lineHeight: 1.6 }}>
                        This scan does not contain any vulnerability records yet. Upload a new SBOM or run the vulnerability enrichment process to populate CVE data.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="vuln-section cardvuln">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Vulnerabilities</h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92em' }}>
                        Showing {filteredVulns.length} of {allVulns.length} CVE{allVulns.length !== 1 ? 's' : ''}.
                    </p>
                </div>
                <div className="filters" style={{ gap: '0.75rem' }}>
                    <button
                        className={`filter-btn${showUnfixedOnly ? '-active' : ''}`}
                        onClick={() => setShowUnfixedOnly((prev) => !prev)}
                    >
                        {showUnfixedOnly ? 'Show all CVEs' : 'Show only unfixed'}
                    </button>
                </div>
            </div>

            <div className="table-scroll" style={{ overflowX: 'auto' }}>
                <table className="vuln-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['cve_id', 'component_name', 'severity', 'cvss_score', 'fixed_version', 'description'].map((field) => (
                                <th
                                    key={field}
                                    onClick={() => toggleSort(field)}
                                    style={{ cursor: 'pointer', padding: '0.8rem 0.9rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}
                                >
                                    {field === 'cve_id' ? 'CVE' : field === 'component_name' ? 'Component' : field === 'cvss_score' ? 'CVSS' : field === 'fixed_version' ? 'Fixed in' : 'Description'}
                                    {sortField === field ? (sortDirection === 'desc' ? ' ▼' : ' ▲') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVulns.map((vuln, index) => (
                            <tr key={vuln.cve_id ?? index} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }} onClick={() => setSelectedVuln(vuln)}>
                                <td className="mono-cell" style={{ padding: '0.8rem 0.9rem' }}>{vuln.cve_id || vuln.cve || 'N/A'}</td>
                                <td style={{ padding: '0.8rem 0.9rem' }}>{vuln.component_name || vuln.package || 'Unknown'}</td>
                                <td style={{ padding: '0.8rem 0.9rem', color: SEVERITY_VAR[vuln.level] || 'var(--teal)' }}>{(vuln.severity || vuln.level || 'Unknown').toUpperCase()}</td>
                                <td style={{ padding: '0.8rem 0.9rem' }}>{typeof vuln.cvss_score === 'number' ? vuln.cvss_score.toFixed(1) : vuln.cvss_score || '—'}</td>
                                <td style={{ padding: '0.8rem 0.9rem' }}>{vuln.fixed_version || 'Unfixed'}</td>
                                <td style={{ padding: '0.8rem 0.9rem' }} title={vuln.description}>{vuln.description ? `${vuln.description.slice(0, 120)}${vuln.description.length > 120 ? '…' : ''}` : 'No description'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedVuln && (
                <VulnModal
                    vuln={selectedVuln}
                    onClose={() => setSelectedVuln(null)}
                />
            )}
        </section>
    );
}

export default Vulnsection;