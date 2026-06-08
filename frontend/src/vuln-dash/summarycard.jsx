import { useState } from "react";

function SummaryCard({
    groupedVulns,
    totalComponents
}) {
    const [activeFilter, setActiveFilter] = useState(null);

    const allVulns = Object.entries(groupedVulns).flatMap(
        ([level, vulns]) =>
            vulns.map(v => ({
                ...v,
                level
            }))
    );

    const filteredVulns = activeFilter
        ? allVulns.filter(
            v =>
                (v.status ?? "new").toLowerCase() === activeFilter
        )
        : allVulns;

    const critical = groupedVulns.critical.length;
    const high = groupedVulns.high.length;
    const medium = groupedVulns.medium.length;
    const low = groupedVulns.low.length;

    return (
        <div className="summary-section">

            <div className="summary-card cardvuln">
                <h2>Overview</h2>

                <div className="metric">
                    <span>Total Components</span>
                    <span>{totalComponents}</span>
                </div>

                <div className="metric">
                    <span>Vulnerabilities</span>
                    <span>{allVulns.length}</span>
                </div>

                <div className="metric critical">
                    <span>Critical</span>
                    <span style={{ color: "var(--critical)" }}>
                        {critical}
                    </span>
                </div>

                <div className="metric high">
                    <span>High</span>
                    <span style={{ color: "var(--high)" }}>
                        {high}
                    </span>
                </div>

                <div className="metric medium">
                    <span>Medium</span>
                    <span style={{ color: "var(--medium)" }}>
                        {medium}
                    </span>
                </div>

                <div className="metric low">
                    <span style={{ color: "var(--low)" }}>
                        Low
                    </span>
                    <span>{low}</span>
                </div>
            </div>

            <div className="remedy-card cardvuln">
                <div className="header-card">
                    <h2>Vulnerabilities</h2>

                    <div className="filter-btns">
                        <button
                            className={`filter-btn${
                                activeFilter === "new"
                                    ? "-active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveFilter(
                                    activeFilter === "new"
                                        ? null
                                        : "new"
                                )
                            }
                        >
                            New
                        </button>
                    </div>
                </div>

                <div className="item-vuln">
                    {filteredVulns.map((vuln, i) => (
                        <div
                            key={vuln.cve ?? i}
                            className={`remedy-item ${vuln.level}`}
                        >
                            <span className="component-name">
                                {vuln.cve}
                            </span>

                            <span
                                className={`status-badge-${
                                    vuln.level === "critical" ||
                                    vuln.level === "high"
                                        ? "unfixed"
                                        : "new"
                                }`}
                            >
                                {vuln.severity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="heatmap cardvuln">
                <h2>Heatmap</h2>

                <p>
                    Critical: {critical}
                </p>

                <p>
                    High: {high}
                </p>

                <p>
                    Medium: {medium}
                </p>

                <p>
                    Low: {low}
                </p>
            </div>

        </div>
    );
}

export default SummaryCard;