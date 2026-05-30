import "./ProjectPage.css"
import {mockProjects, mockScans} from "./data.js"
import { useState } from "react";
import {Plus} from "lucide-react";
import {Dot} from "lucide-react";
import InventoryChart from "./BarChart.jsx"
function Projectpage(){
        const [selectedProject, setSelectedProject]= useState(mockProjects[0])
        const projectScans = mockScans.filter(scan => scan.projectId === selectedProject.id)
        const sortedScans = [...projectScans].sort((a, b) => new Date(b.date) - new Date(a.date))
        const latestScan = sortedScans[0]
        const previousScan = sortedScans[1]

        const getDelta = (field) => {
            if (!latestScan || !previousScan) return null
            return latestScan[field] - previousScan[field]
        }
        console.log("latestScan ecosystems:", latestScan?.ecosystems)
        const Delta = ({ value }) => {
            if (value === null) return null
            if (value === 0) return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75em" }}>— no change</span>
            const positive = value > 0
            return (
                <span style={{
                    color: positive ? "var(--critical)" : "var(--low)",
                    fontSize: "0.75em",
                    marginTop: "0.25em",
                    display: "block"
                }}>
                    {positive ? `▲ +${value}` : `▼ ${value}`}
                </span>
            )
        }

    return(
        <div id="parent-container">
            <header className="project-header">
            <img className="logo" src="/logo.png"></img>
            <div className="profile-circle">
            <svg id="user-profile" width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="var(--textlight)"/>
            <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="var(--textlight)"/>
            </svg>
            </div>
            </header>
            <div className="project-container">
                <div>.</div>
                <ul id="project-list"> {mockProjects.map(project =>
                    (
                        <li key={project.id} onClick={()=>{
                                setSelectedProject(project)
                            }} className={selectedProject.id==project.id ?"active-project":"idle-project"}>{project.name}
                        </li>
                    )
                )}</ul>
                <div id="content">
                    <div id="header-content">
                        <p id="project-name">{selectedProject.name}</p>
                        <button id="add-btn">
                            <Plus color="var(--textlight)"></Plus>
                            <p>New Scan</p>
                        </button>
                    </div>
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
                        <table id="vuln-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Components</th>
                                    <th>Critical</th>
                                    <th>High</th>
                                    <th>Medium</th>
                                    <th>Low</th>
                                    <th>Progress</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectScans.map(scan => (
                                    <tr key={scan.id}>
                                        <td>{scan.date}</td>
                                        <td>{scan.components}</td>
                                        <td style={{color:"var(--critical)"}}>{scan.critical}</td>
                                        <td style={{color:"var(--high)"}}>{scan.high}</td>
                                        <td style={{color:"var(--medium)"}}>{scan.medium}</td>
                                        <td style={{color:"var(--low)"}}>{scan.low}</td>
                                        <td style={{
                                            color: scan.progress === "Complete" ? "var(--low)" : 
                                                scan.progress === "In progress" ? "var(--medium)" : 
                                                scan.progress === "Error" ? "var(--critical)" : "var(--textlight)"
                                        }}>
                                            {scan.progress}
                                        </td>
                                        <td><button className="view-btn">View →</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div id="stats-bar" className="card">
                        <div className="stat-card">
                            <p className="stat-label">Total Scans</p>
                            <p className="stat-value">{projectScans.length}</p>
                        </div>
                        <div className="stat-card change-stat">
                            <p className="stat-label">Latest Critical</p>
                            <div className="change-stat-container">
                            <p className="stat-value" style={{color:"var(--critical)"}}>
                                {latestScan ? latestScan.critical : 0}
                            </p>
                            <Delta value={getDelta("critical")} />
                            </div>
                        </div>

                        <div className="stat-card change-stat">
                            <p className="stat-label">Components</p>
                            <div className="change-stat-container">
                            <p className="stat-value">
                                {latestScan ? latestScan.components : 0}
                            </p>
                            <Delta value={getDelta("components")} />
                            </div>
                        </div>
                        <div className="stat-card">
                            
                            <p className="stat-label">Last Scanned</p>
                            <p className="stat-value">
                                {latestScan ? latestScan.date.substring(0, 6) : "Never"}
                            </p>
                        </div>
                    </div>
                    <div className="card" id="vul-overview">Vuln. hello i am vedika. Vuln. hello i am vedikaVuln. hello i am vedikaVuln. hello i am vedikaVuln. hello i am vedikaVuln. hello i am vedikaVuln. hello i am vedikaVuln. hello i am vedika</div>
                    </div>
            </div>
        </div>
    )
}
export default Projectpage;