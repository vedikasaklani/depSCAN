import "./vuln-dash.css";
import { useState } from "react";

function Vulnsection({ groupedVulns }) {

    const severityLevels = [
        "critical",
        "high",
        "medium",
        "low"
    ];

    const [activeFilter, setActiveFilter] =
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
                            {level}
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

        </section>
    );
}

export default Vulnsection;