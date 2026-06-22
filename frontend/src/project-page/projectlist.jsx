import "./ProjectPage.css";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ChartContainer from "./ChartContainer.jsx";
import { useNavigate } from "react-router-dom";
import VulnTable from "./VulnTable.jsx";
import StatsBar from "./StatsBar.jsx";
import NewScanModal from "./NewScanModal.jsx";
import { fetchAllScans, fetchComponents, fetchVulns, fetchProjectHistory } from "../api/api.js";

async function normalizeScans(history, projectId) {

    return Promise.all(
        history.map(async (scan) => {
            const [components, vulns] = await Promise.all([
                fetchComponents(scan.sbom_id),
                fetchVulns(scan.sbom_id),
            ]);

            const severityCounts = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            };

            vulns.forEach(v => {
                switch ((v.severity || "").toUpperCase()) {
                    case "CRITICAL":
                        severityCounts.critical++;
                        break;
                    case "HIGH":
                        severityCounts.high++;
                        break;
                    case "MEDIUM":
                        severityCounts.medium++;
                        break;
                    case "LOW":
                        severityCounts.low++;
                        break;
                }
            });

            return {
                id: scan.sbom_id,
                projectId,

                date: scan.uploaded_at,
                components: components.length,

                critical: severityCounts.critical,
                high: severityCounts.high,
                medium: severityCounts.medium,
                low: severityCounts.low,

                progress: "Complete",

                ecosystems: []
            };
        })
    );
}

function Projectpage() {
    const navigate = useNavigate();
    const [uniqueProjects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showNewScan, setShowNewScan] = useState(false);
    const [projectScans, setProjectScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchAllScans()
            .then((scans) => {
                const uniqueProjects = [
                    ...new Map(
                        scans
                            .filter(scan => scan.project)
                            .map(scan => [
                                scan.project,
                                {
                                    name: scan.project,
                                    id: scan.sbom_id
                                }
                            ])
                    ).values()
                ];

                setProjects(uniqueProjects);

                if (uniqueProjects.length > 0) {
                    setSelectedProject(uniqueProjects[0]);
                }
            })
            .catch((err) => setError(err.message));
    }, []);
    useEffect(() => {
        setError(null);

        if (!selectedProject) {
            setProjectScans([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchProjectHistory(selectedProject.name)
            .then(async (history) => {
                const scans = await normalizeScans(
                    history,
                    selectedProject.id
                );

                setProjectScans(scans);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [selectedProject]);

    const sortedScans = [...projectScans].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestScan = sortedScans[0];
    const previousScan = sortedScans[1];

    const handleScanSubmit = async (scanConfig) => {
        try {
            const projectName = scanConfig.projectName || selectedProject?.name;
            const projectId = scanConfig.id || scanConfig.sbom_id || selectedProject?.id || projectName;
            const history = await fetchProjectHistory(
                projectName
            );
            const scans = await normalizeScans(
                history,
                projectId
            );

            setProjects((projects) => {
                const nextProject = { name: projectName, id: projectId };
                const withoutDuplicate = projects.filter(project => project.name !== projectName);
                return [nextProject, ...withoutDuplicate];
            });
            setSelectedProject({ name: projectName, id: projectId });
            setProjectScans(scans);
        } catch (err) {
            console.error("Upload failed:", err.message);
        }
    };

    return (
        <div id="parent-container">
            <header className="project-header">
                <img className="logo" src="/logo.png" alt="logo" />
                <div className="profile-circle">
                    <svg id="user-profile" width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="var(--textlight)" />
                        <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="var(--textlight)" />
                    </svg>
                </div>
            </header>

            <div className="project-container">
                <ul id="project-list">
                    {uniqueProjects.map(project => (
                        <li
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={selectedProject?.id === project.id ? "active-project" : "idle-project"}
                        >
                            {project.name}
                        </li>
                    ))}
                </ul>

                <div id="content">
                    <div id="header-content">
                        <p id="project-name">{selectedProject?.name}</p>
                        <button id="add-btn" onClick={() => setShowNewScan(true)}>
                            <Plus color="var(--textlight)" size={15} />
                            <p>New Project</p>
                        </button>
                    </div>

                    {loading && (
                        <p style={{ gridColumn: " 1 / -1", justifySelf: "center", marginTop: "1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.82em", padding: "1em" }}>
                            Loading scans...
                        </p>
                    )}
                    {error && (
                        <p style={{ gridColumn: "1/-1", color: "var(--critical)", fontSize: "0.82em", padding: "1em" }}>
                            {error}
                        </p>
                    )}

                    <ChartContainer projectScans={projectScans} latestScan={latestScan} />
                    <VulnTable selectedProject={selectedProject} projectScans={projectScans} />
                    <StatsBar
                        selectedProject={selectedProject}
                        previousScan={previousScan}
                        latestScan={latestScan}
                        projectScans={projectScans}
                    />
                    <div className="card" id="ntia-score">NTIA Score</div>
                </div>
            </div>

            {showNewScan && (
                <NewScanModal
                    onClose={() => setShowNewScan(false)}
                    onSubmit={handleScanSubmit}
                />
            )}
        </div>
    );
}

export default Projectpage;
