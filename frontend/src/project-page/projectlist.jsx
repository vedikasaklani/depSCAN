import "./ProjectPage.css";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ChartContainer from "./ChartContainer.jsx";
import { useNavigate } from "react-router-dom";
import VulnTable from "./VulnTable.jsx";
import StatsBar from "./StatsBar.jsx";
import NewScanModal from "./NewScanModal.jsx";
import { fetchAllScans, fetchComponents, fetchVulns, fetchProjectHistory, uploadSBOM } from "../api/api.js";
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

                date: scan.uploaded_at
                    ? new Date(scan.uploaded_at).toLocaleString()
                    : "—",

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
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showNewScan, setShowNewScan] = useState(false);
    const [projectScans, setProjectScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchAllScans()
            .then((scans) => {
                const projects = scans.map((scan) => ({
                    id: scan.sbom_id,
                    name: scan.project,
                }));

                setProjects(projects);

                if (projects.length > 0) {
                    setSelectedProject(projects[0]);
                }
            })
            .catch((err) => setError(err.message));
    }, []);
    useEffect(() => {
        setLoading(true);
        setError(null);
        if (!selectedProject) return;
        fetchProjectHistory(selectedProject.name)
            .then(async (history) => {
                const scans = await normalizeScans(
                    history,
                    selectedProject.id
                );

                setProjectScans(scans);
            })
    }, [selectedProject]);

    const sortedScans = [...projectScans].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestScan = sortedScans[0];
    const previousScan = sortedScans[1];

    const handleScanSubmit = async (scanConfig) => {
        try {
            const sbomPayload = {
                bomFormat: "CycloneDX",
                specVersion: "1.4",
                metadata: {
                    timestamp: new Date().toISOString(),
                    component: { name: scanConfig.projectName },
                },
                properties: [
                    { name: "source", value: scanConfig.source },
                    { name: "branch", value: scanConfig.branch },
                    { name: "scanType", value: scanConfig.scanType },
                ],
                components: [],
            };
            await uploadSBOM(sbomPayload);

            // Use fetchProjectHistory instead of fetchAllScans + filter
            const history = await fetchProjectHistory(
                selectedProject.name
            );
            const scans = await normalizeScans(
                history,
                selectedProject.id
            );

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
                    {projects.map(project => (
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
                            <p>New Scan</p>
                        </button>
                    </div>

                    {loading && (
                        <p style={{ gridColumn: "1/-1", color: "rgba(255,255,255,0.3)", fontSize: "0.82em", padding: "1em" }}>
                            Loading scans…
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