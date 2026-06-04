import InventoryChart from "./InventoryChart"
import { Dot } from "lucide-react";
function ChartContainer({ projectScans, latestScan }) {
    return (
        <div id="chart-container" className="card">
            <div id="legend"><ul>
                <li><Dot color="var(--critical)"></Dot>Critical</li>
                <li><Dot color="var(--high)"></Dot>High</li>
                <li><Dot color="var(--medium)"></Dot>Medium</li>
                <li><Dot color="var(--low)"></Dot>Low</li>
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