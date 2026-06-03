import "./ProjectPage.css"
import { mockProjects, mockScans } from "./data.js"
import { useState } from "react";
import { Plus } from "lucide-react";
import ChartContainer from "./ChartContainer.jsx";
import { useNavigate } from "react-router-dom";
import VulnTable from "./VulnTable.jsx";
import StatsBar from "./StatsBar.jsx";
function Projectpage() {
    const navigate = useNavigate()
    const [selectedProject, setSelectedProject] = useState(mockProjects[0])
    const projectScans = mockScans.filter(scan => scan.projectId === selectedProject.id)
    const sortedScans = [...projectScans].sort((a, b) => new Date(b.date) - new Date(a.date))
    const latestScan = sortedScans[0]
    const previousScan = sortedScans[1]
    return (
        <div id="parent-container">
            <header className="project-header">
                <img className="logo" src="/logo.png"></img>
                <div className="profile-circle">
                    <svg id="user-profile" width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="var(--textlight)" />
                        <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="var(--textlight)" />
                    </svg>
                </div>
            </header>
            <div className="project-container">

                <ul id="project-list"> {mockProjects.map(project =>
                (
                    <li key={project.id} onClick={() => {
                        setSelectedProject(project)
                    }} className={selectedProject.id == project.id ? "active-project" : "idle-project"}>{project.name}
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
                    <ChartContainer projectScans={projectScans} latestScan={latestScan}></ChartContainer>
                    <VulnTable selectedProject={selectedProject}></VulnTable>
                    <StatsBar selectedProject={selectedProject} previousScan={previousScan} latestScan={latestScan} projectScans={projectScans}></StatsBar>
                    <div className="card" id="ntia-score">NTIA Score</div>
                </div>
            </div>
        </div>
    )
}
export default Projectpage;