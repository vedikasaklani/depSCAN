import { mockScans } from "../project-page/data";
import { dashboardData } from "./dashboardData";
import SeverityHeatmap from "./SeverityHeatmap";
import { useState } from "react";
function SummaryCard({ id }) {
    const scan = mockScans.find(
        scan => scan.id === Number(id)
    );
    const [activeFilter, setActiveFilter] = useState(null);

    const report = dashboardData[id];
    const { vulnerabilities } = report;
    const allVulns = Object.entries(vulnerabilities).flatMap(([level, vulns]) =>
        vulns.map(v => ({ ...v, level }))
    );
    const filteredVulns = activeFilter
        ? allVulns.filter(v => v.status === activeFilter)
        : allVulns;

    return (
        <div className="summary-section">
            <div className="summary-card cardvuln">
                <h2>Overview</h2>

                <div className="metric">
                    <span>Total Components</span>
                    <span>{scan.components}</span>
                </div>

                <div className="metric">
                    <span>Vulnerabilities</span>
                    <span>{scan.critical + scan.high + scan.medium + scan.low}</span>
                </div>

                <div className="metric critical">
                    <span>Critical</span>
                    <span style={{ color: "var(--critical" }}>{scan.critical}</span>
                </div>

                <div className="metric high">
                    <span>High</span>
                    <span style={{ color: "var(--high" }}>{scan.high}</span>
                </div>

                <div className="metric medium">
                    <span>Medium</span>
                    <span style={{ color: "var(--medium" }}>{scan.medium}</span>
                </div>

                <div className="metric low">
                    <span>Low</span>
                    <span style={{ color: "var(--low" }}>{scan.low}</span>
                </div>

            </div>
            <div className="remedy-card cardvuln">
                <div className="header-card">
                    <h2>Vulnerabilities</h2>
                    <div className="filter-btns">
                        <button
                            className={`filter-btn${activeFilter === "unfixed" ? "-active" : ""}`}
                            onClick={() => setActiveFilter(prev => prev === "unfixed" ? null : "unfixed")}
                        >
                            Unfixed
                        </button>
                        <button
                            className={`filter-btn${activeFilter === "new" ? "-active" : ""}`}
                            onClick={() => setActiveFilter(prev => prev === "new" ? null : "new")}
                        >
                            New
                        </button>
                    </div>
                </div>
                <div className="item-vuln">
                    {filteredVulns.map(vuln => (
                        <div key={vuln.id} className={`remedy-item ${vuln.level}`}>
                            <span className="component-name">{vuln.component}</span>
                            <span className={`status-badge-${vuln.status}`}>{vuln.status}</span>
                        </div>
                    ))}
                </div>
            </div>
            <SeverityHeatmap id={id} />

        </div>
    )
}
export default SummaryCard