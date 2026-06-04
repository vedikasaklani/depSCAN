import "./vuln-dash.css"
import { dashboardData } from "./dashboardData";
import { useState } from "react";
function Vulnsection({ id }) {
    const severityLevels = [
        "critical",
        "high",
        "medium",
        "low"
    ];
    const report = dashboardData[id];
    const { vulnerabilities } = report

    const [activeFilter, setActiveFilter] = useState(null);
    const allVulns = Object.entries(vulnerabilities).flatMap(([level, vulns]) =>
        vulns.map(v => ({ ...v, level }))
    );
    const filteredVulns = activeFilter
        ? allVulns.filter(v => v.status === activeFilter && (activeFilter !== 'unfixed' || v.fixedInVersion === null))
        : allVulns;
    return (
        <section className="vuln-section cardvuln">

            <div className="section-header">

                <h2>Vulnerabilities</h2>

                <div className="filters">
                    <button onClick={() => setActiveFilter(null)} className={`filter-btn${activeFilter === "all" ? "-active" : ""}`}>All</button>
                    <button onClick={() => setActiveFilter("new")}  className={`filter-btn${activeFilter === "new" ? "-active" : ""}`}>New</button>
                    <button  onClick={() => setActiveFilter("unfixed")} className={`filter-btn${activeFilter === "unfixed" ? "-active" : ""}`}>Unfixed</button>
                </div>

            </div>

            <div className="severity-grid">

                {severityLevels.map(level => (
                    <div
                        key={level}
                        className={`cardvuln severity-column ${level}`}
                    >
                        <h3 className="header-card">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </h3>
                        {filteredVulns
                            .filter(vuln => vuln.level === level)
                            .map(vuln => (
                                <div
                                    key={vuln.id}
                                    className="vulnerability-card"
                                >
                                    <h4>{vuln.id}</h4>
                                    <p style={{ margin: '0.5rem 0 0.4rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>{vuln.description}</p>
                                    <p style={{ margin: 0 }}>{vuln.component}</p>
                                    <span>{vuln.version}</span>
                                    <div style={{ marginTop: '0.75rem' }}>
                                        {vuln.fixedInVersion ? (
                                            <span className="status-badge-new">Fixed in v{vuln.fixedInVersion}</span>
                                        ) : (
                                            <span className="status-badge-unfixed">No fix available</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}

            </div>

        </section>)
}
export default Vulnsection;