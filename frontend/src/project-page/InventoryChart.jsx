import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function InventoryChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <p style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85em",
                textAlign: "center"
            }}>
                No inventory data
            </p>
        )
    }

    // normalize data keys so missing severities don't break the chart
    const chartData = (data || []).map((d) => ({
        ecosystem: d.ecosystem || d.name || "unknown",
        critical: Number(d.critical || d.Critical || 0),
        high: Number(d.high || d.High || 0),
        medium: Number(d.medium || d.Medium || 0),
        low: Number(d.low || d.Low || 0),
        none: Number(d.none || d.clean || d.no_vuln || 0),
    }))

    return (
        <ResponsiveContainer width="100%" height={chartData.length * 35 + 10}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
                barCategoryGap="15%"
                barSize={22}
            >
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis
                    type="category"
                    dataKey="ecosystem"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "'Arial Narrow', sans-serif", letterSpacing: "0px" }}
                    width={50}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: 0,
                    }}
                    wrapperStyle={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: 0,
                    }}
                    content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const entry = payload.reduce((acc, p) => {
                            acc[p.dataKey] = p.value || 0;
                            return acc;
                        }, {});

                        return (
                            <div style={{
                                minWidth: 140,
                                backgroundColor: "#091014",
                                border: "1px solid rgba(0,255,179,0.35)",
                                borderRadius: 6,
                                padding: "0.65em 0.9em",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.55)",
                                fontSize: "0.78em",
                                fontFamily: "'Arial Narrow', 'Helvetica Neue', sans-serif",
                                letterSpacing: "0px",
                                color: "rgba(255,255,255,0.92)"
                            }}>
                                <div style={{
                                    fontWeight: 700,
                                    marginBottom: 6,
                                    color: "#ffffff",
                                    borderBottom: "1px solid rgba(0,255,179,0.18)",
                                    paddingBottom: 4,
                                    letterSpacing: "0px"
                                }}>{label}</div>
                                <div style={{ color: "rgba(255,255,255,0.8)", marginBottom: 4, letterSpacing: "0px" }}>Clean: {entry.none ?? 0}</div>
                                <div style={{ color: "#FC3407", marginBottom: 3, letterSpacing: "0px" }}>Critical: {entry.critical ?? 0}</div>
                                <div style={{ color: "#E76736", marginBottom: 3, letterSpacing: "0px" }}>High: {entry.high ?? 0}</div>
                                <div style={{ color: "#FFD339", marginBottom: 3, letterSpacing: "0px" }}>Medium: {entry.medium ?? 0}</div>
                                <div style={{ color: "#2BB8FF", letterSpacing: "0px" }}>Low: {entry.low ?? 0}</div>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="critical" stackId="a" fill="#FC3407" activeBar={false} isAnimationActive={false} />
                <Bar dataKey="high" stackId="a" fill="#E76736" activeBar={false} isAnimationActive={false} />
                <Bar dataKey="medium" stackId="a" fill="#FFD339" activeBar={false} isAnimationActive={false} />
                <Bar dataKey="low" stackId="a" fill="#2BB8FF" activeBar={false} isAnimationActive={false} />
                <Bar dataKey="none" stackId="a" fill="rgba(207, 254, 239, 0.81)" radius={[0, 4, 4, 0]} activeBar={false} isAnimationActive={false} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default InventoryChart