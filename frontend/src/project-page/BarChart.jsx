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

    return (
        <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data} layout="vertical" margin={{top: 0, right: 5, left: 0, bottom: 0}}>
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="ecosystem"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    width={45}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                        backgroundColor: "var(--black)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "var(--textlight)",
                        fontSize: "0.8em"
                    }}
                    formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Bar dataKey="critical" stackId="a" fill="#FC3407" activeBar={false} isAnimationActive={false}/>
                <Bar dataKey="high" stackId="a" fill="#E76736" activeBar={false} isAnimationActive={false}/>
                <Bar dataKey="medium" stackId="a" fill="#FFD339" activeBar={false} isAnimationActive={false}/>
                <Bar dataKey="clean" stackId="a" fill="rgba(207, 254, 239, 0.81)" radius={[0, 4, 4, 0]} activeBar={false} isAnimationActive={false}/>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default InventoryChart