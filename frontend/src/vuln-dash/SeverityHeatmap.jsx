const SEVERITIES = ["critical", "high", "medium", "low"];

const SEVERITY_COLORS = {
    critical: "var(--critical)",
    high: "var(--high)",
    medium: "var(--medium)",
    low: "var(--low)",
};

export default function SeverityHeatmap({ groupedVulns }) {
    // Build a map of component -> { critical, high, medium, low }
    const componentMap = {};
    SEVERITIES.forEach((level) => {
        (groupedVulns[level] || []).forEach((vuln) => {
            const name = vuln.component_name ?? "Unknown";
            if (!componentMap[name])
                componentMap[name] = { critical: 0, high: 0, medium: 0, low: 0 };
            componentMap[name][level] += 1;
        });
    });

    const components = Object.keys(componentMap);

    const maxCount = Math.max(
        1,
        ...components.flatMap((c) => SEVERITIES.map((s) => componentMap[c][s] || 0))
    );

    if (components.length === 0) {
        return (
            <section className="cardvuln heatmap" style={{ padding: "0.6rem" }}>
                <h3 className="header-card">Severity Heatmap</h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88em", marginTop: "0.5em" }}>
                    No vulnerability data to display.
                </p>
            </section>
        );
    }

    return (
        <section className="cardvuln heatmap" style={{ padding: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="header-card">Severity Heatmap</h3>
                <span className="stat-label">Components: {components.length}</span>
            </div>

            <div style={{ overflowX: "auto", marginTop: "0.6rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", color: "rgba(255,255,255,0.7)" }}>
                            <th style={{ padding: "0.45rem 0.6rem" }}>Component</th>
                            {SEVERITIES.map((s) => (
                                <th key={s} style={{ padding: "0.45rem 0.6rem" }}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((comp) => (
                            <tr key={comp}>
                                <td style={{ padding: "0.35rem 0.6rem", color: "var(--textlight)", fontFamily: "Anta" }}>
                                    {comp}
                                </td>
                                {SEVERITIES.map((s) => {
                                    const count = componentMap[comp][s] || 0;
                                    const opacity = count > 0
                                        ? Math.min(0.95, 0.2 + (count / maxCount) * 0.8)
                                        : 0.06;
                                    return (
                                        <td key={s} style={{ padding: "0.35rem 0.6rem" }}>
                                            <div style={{ width: 56, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 6,
                                                    background: SEVERITY_COLORS[s],
                                                    opacity,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    {count > 0 ? (
                                                        <span style={{ color: "#07101d", fontWeight: 700, fontSize: "0.85rem" }}>
                                                            {count}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: "rgba(255,255,255,0.35)" }}>—</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}