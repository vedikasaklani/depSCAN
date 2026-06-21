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

function VulnModal({ cveId, onClose }) {

    const [data, setData] = useState(null);
    const [status, setStatus] = useState("loading"); 

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");
        setData(null);

        fetch(`${API_BASE}/${encodeURIComponent(cveId)}`)
            .then(res => {
                if (!res.ok) throw new Error(`Request failed (${res.status})`);
                return res.json();
            })
            .then(json => {
                if (!cancelled) {
                    setData(json);
                    setStatus("ready");
                }
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [cveId]);

    useEffect(() => {
        const onKeyDown = e => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const severityKey = data?.severity?.toLowerCase();
    const severityColor = SEVERITY_VAR[severityKey] ?? "var(--teal)";

    return (
        <div className="vuln-modal-backdrop" onClick={onClose}>
            <div
                className="vuln-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Vulnerability detail for ${cveId}`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="vuln-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                {status === "loading" && (
                    <div className="vuln-modal-status">
                        FETCHING VULNERABILITY DATA
                        <span className="blinking-cursor">_</span>
                    </div>
                )}

                {status === "error" && (
                    <div className="vuln-modal-status vuln-modal-status-error">
                        [ ERROR ] COULD NOT LOAD {cveId}
                    </div>
                )}

                {status === "ready" && data && (
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
                                    {data.component_name} {data.component_version}
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
                                    {data.purl}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Published</span>
                                <span className="vuln-modal-value">
                                    {formatDate(data.published)}
                                </span>
                            </div>

                            <div>
                                <span className="vuln-modal-label">Modified</span>
                                <span className="vuln-modal-value">
                                    {formatDate(data.modified)}
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
                            <p className="vuln-modal-summary">{data.summary}</p>
                        )}

                        {data.description && (
                            <p className="vuln-modal-description">
                                {data.description}
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

    const [selectedCve, setSelectedCve] =
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
                                    key={vuln.cve ?? i}
                                    className="vulnerability-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                        setSelectedCve(vuln.cve)
                                    }
                                    onKeyDown={e => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSelectedCve(vuln.cve);
                                        }
                                    }}
                                >
                                    <h4>
                                        {vuln.cve}
                                    </h4>

                                    <p>
                                        {vuln.component ??
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

            {selectedCve && (
                <VulnModal
                    cveId={selectedCve}
                    onClose={() => setSelectedCve(null)}
                />
            )}

        </section>
    );
}

export default Vulnsection;