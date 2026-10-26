import { useState } from "react";
import SeverityHeatmap from "./SeverityHeatmap";
import DashboardCardHeader from "./DashboardCardHeader.jsx";

function SummaryCard({ groupedVulns, totalComponents }) {
    const [activeFilter, setActiveFilter] = useState(null);

    const allVulns = Object.entries(groupedVulns).flatMap(
        ([level, vulns]) => vulns.map(v => ({ ...v, level }))
    );

    const filteredVulns = activeFilter
        ? allVulns.filter(v => (v.status ?? "new").toLowerCase() === activeFilter)
        : allVulns;

    const critical = groupedVulns.critical.length;
    const high = groupedVulns.high.length;
    const medium = groupedVulns.medium.length;
    const low = groupedVulns.low.length;

    return (
        <div className="summary-section">

            <div className="summary-card cardvuln app-surface">
                <DashboardCardHeader title="Overview">
                    <div className="overview-totals">
                        <div className="overview-total vuln-pill vuln-pill-filled">
                            <span>Total comp:</span>
                            <strong>{totalComponents}</strong>
                        </div>
                        <div className="overview-total vuln-pill vuln-pill-filled">
                            <span>Vuln:</span>
                            <strong>{allVulns.length}</strong>
                        </div>
                    </div>
                </DashboardCardHeader>

                <div className="severity-summary-list">
                    <div className="metric critical">
                        <span>Critical</span>
                        <span style={{ color: "var(--critical)" }}>{critical}</span>
                    </div>

                    <div className="metric high">
                        <span>High</span>
                        <span style={{ color: "var(--high)" }}>{high}</span>
                    </div>

                    <div className="metric medium">
                        <span>Medium</span>
                        <span style={{ color: "var(--medium)" }}>{medium}</span>
                    </div>

                    <div className="metric low">
                        <span style={{ color: "var(--low)" }}>Low</span>
                        <span>{low}</span>
                    </div>
                </div>
            </div>

            <div className="remedy-card cardvuln app-surface">
                <DashboardCardHeader title="Vulnerabilities">
                    <div className="filter-btns">
                        <button
                            className={`filter-btn${activeFilter === "unfixed" ? "-active" : ""} vuln-pill${activeFilter === "unfixed" ? " vuln-pill-filled" : ""}`}
                            onClick={() => setActiveFilter(prev => prev === "unfixed" ? null : "unfixed")}
                        >
                            Unfixed
                        </button>
                        <button
                            className={`filter-btn${activeFilter === "new" ? "-active" : ""} vuln-pill${activeFilter === "new" ? " vuln-pill-filled" : ""}`}
                            onClick={() => setActiveFilter(prev => prev === "new" ? null : "new")}
                        >
                            New
                        </button>
                    </div>
                </DashboardCardHeader>

                <div className="item-vuln">
                    {filteredVulns.length === 0 && (
                        <p className="empty-vuln-msg">
                            No vulnerabilities match this filter.
                        </p>
                    )}
                    {filteredVulns.map((vuln, i) => {
                        const status = (vuln.status ?? "new").toLowerCase();
                        return (
                            <div key={vuln.cve_id ?? i} className={`remedy-item ${vuln.level}`}>
                                <div className="remedy-item-main">
                                    <span className="component-name">{vuln.cve_id ?? "Unknown CVE"}</span>
                                    <span className="component-sub"> 
                                        {" "+ vuln.component_name ?? vuln.package ?? "Unknown component"}
                                    </span>
                                </div>
                                <span className={`status-badge-${status}`}>
                                    {status === "unfixed" ? "Unfixed" : "New"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <SeverityHeatmap groupedVulns={groupedVulns} />

        </div>
    );
}

export default SummaryCard;
