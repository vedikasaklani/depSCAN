import { PieChart, Pie, Cell, Tooltip} from "recharts"

const COLORS = [
    "var(--critical)",
    "var(--high)", 
    "var(--medium)",
    "var(--low)"
]

export function DonutChart({ scans }) {
    const totals = scans.reduce((acc, scan) => {
        acc.critical += scan.critical
        acc.high += scan.high
        acc.medium += scan.medium
        acc.low += scan.low
        return acc
    }, { critical: 0, high: 0, medium: 0, low: 0 })

    const donutData = [
        { name: "Critical", value: totals.critical },
        { name: "High", value: totals.high },
        { name: "Medium", value: totals.medium },
        { name: "Low", value: totals.low },
    ]

    return (
    <PieChart width={250} height={150}>
        <Pie
            data={donutData}
            cx={70}
            cy={70}
            innerRadius={45}
            outerRadius={65}
            dataKey="value"
            strokeWidth={0}
            paddingAngle={2}
        >
            {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
        </Pie>
        <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{
                backgroundColor: "var(--blackgrey)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--textlight)",
                fontSize: "0.8em",
                padding: "0.2em 0.5em"
            }}
        />
    </PieChart>
    )
}
