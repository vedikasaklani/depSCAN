import InventoryChart from "./InventoryChart"
function ChartContainer({ projectScans, latestScan }) {
    return (
        <div id="chart-container" className="card">
            <div id="legend"><ul>
                <li className="legend-pill legend-pill-critical">Critical</li>
                <li className="legend-pill legend-pill-high">High</li>
                <li className="legend-pill legend-pill-medium">Medium</li>
                <li className="legend-pill legend-pill-low">Low</li>
            </ul></div>
            <div id="donut">
                {projectScans.length === 0 ? (
                    <p style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.85em",
                        textAlign: "center",
                    }}>
                        No scans yet
                    </p>
                ) : (
                    <InventoryChart id="bar-chart" data={latestScan ? latestScan.ecosystems : []} />
                )}
            </div>
        </div>
    )
}
export default ChartContainer;
