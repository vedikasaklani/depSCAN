import "./ProjectPage.css"
import {mockProjects, mockScans} from "./data.js"
import { useState } from "react";
import {Plus} from "lucide-react";
import {Dot} from "lucide-react";
import {DonutChart} from "./DonutChart.jsx"
function Projectpage(){
        const [selectedProject, setSelectedProject]= useState(mockProjects[0])
        const projectScans = mockScans.filter(scan => scan.projectId === selectedProject.id)
        const latestScan = projectScans.reduce((latest, scan) => 
        new Date(scan.date) > new Date(latest.date) ? scan : latest, projectScans[0])
        console.log(latestScan)
    return(
        <div id="parent-container">
            <header className="project-header">
            <img className="logo" src="/public/logo.png"></img>
            <div className="profile-circle">
            <svg id="user-profile" width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="var(--textlight)"/>
            <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="var(--textlight)"/>
            </svg>
            </div>
            </header>
            <div className="project-container">
                <ul id="project-list"> {mockProjects.map(project =>
                    (
                        <li key={project.id} onClick={()=>{
                                setSelectedProject(project)
                            }} className={selectedProject.id==project.id ?"active-project":"idle-project"}>{project.name}
                        </li>
                    )
                )}</ul>
                <div id="content">
                    <h1 id="home-title" >My Projects</h1>
                    <h2 id="project-name">{selectedProject.name}</h2>
                    <button id="add-btn">
                        <Plus color="var(--black)"></Plus>
                        <p>New Scan</p>
                    </button>
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
                                <DonutChart scans={latestScan ? [latestScan] : []} />
                            )}
                        </div>
                        <div >.</div>
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
                    </div>
            </div>
        </div>
    )
}
export default Projectpage;