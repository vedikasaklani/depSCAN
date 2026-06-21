import "./vuln-dash.css";
import { useState, useEffect } from "react";

const API_BASE = "/api/vulnerabilities";

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

const severityKey = vuln?.severity?.toLowerCase();    const severityColor = SEVERITY_VAR[severityKey] ?? "var(--teal)";

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

    const severityLevels = [
        "critical",
        "high",
        "medium",
        "low"
    ];

    const [activeFilter, setActiveFilter] =
        useState(null);

    const [selectedVuln, setSelectedVuln] =
        useState(null);
    const allVulns = Object.entries(groupedVulns)
        .flatMap(([level, vulns]) =>
            vulns.map(v => ({
                ...v,
                level
            }))
        );

    const filteredVulns =
        activeFilter
            ? allVulns.filter(
                v =>
                    (v.status ?? "new")
                        .toLowerCase() === activeFilter
            )
            : allVulns;

    return (
        <section className="vuln-section cardvuln">

            <div className="section-header">

                <h2>Vulnerabilities</h2>

                <div className="filters">
                    <button
                        onClick={() =>
                            setActiveFilter(null)
                        }
                        className="filter-btn"
                    >
                        All
                    </button>
                </div>

            </div>

            <div className="severity-grid">

                {severityLevels.map(level => (
                    <div
                        key={level}
                        className={`cardvuln severity-column ${level}`}
                    >
                        <h3 className="header-card">
                            {level.toUpperCase()}
                            {" "}
                            (
                            {groupedVulns[level].length}
                            )
                        </h3>

                        {filteredVulns
                            .filter(
                                vuln =>
                                    vuln.level === level
                            )
                            .map((vuln, i) => (
                                <div
                                    key={vuln.cve_id ?? i}
                                    className="vulnerability-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                        setSelectedVuln(vuln)
                                    }
                                    onKeyDown={e => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSelectedVuln(vuln);;
                                        }
                                    }}
                                >
                                    <h4>
                                        {vuln.cve_id}
                                    </h4>

                                    <p>
                                        {vuln.component_name ??
                                            vuln.package ??
                                            "Unknown"}
                                    </p>

                                    <span>
                                        {vuln.severity}
                                    </span>
                                </div>
                            ))}
                    </div>
                ))}
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